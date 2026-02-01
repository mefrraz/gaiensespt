import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Calendar, Trophy, Filter, Loader2, MapPin, ChevronRight, Clock, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'

// Types
export type Match = {
    slug: string
    data: string
    hora: string
    equipa_casa: string
    equipa_fora: string
    resultado_casa: number | null
    resultado_fora: number | null
    escalao: string
    competicao: string
    local: string | null
    logotipo_casa: string | null
    logotipo_fora: string | null
    status: 'AGENDADO' | 'A DECORRER' | 'FINALIZADO'
}

// Update schedule (in UTC hours)
const WEEKDAY_UPDATES = [15, 21] // 15:00 and 21:00 UTC
const WEEKEND_UPDATES = [11, 13, 15, 17, 18.5, 20, 21.5] // 11:00, 13:00, 15:00, 17:00, 18:30, 20:00, 21:30 UTC

function getNextUpdateTime(): Date {
    const now = new Date()
    const dayOfWeek = now.getUTCDay() // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const schedule = isWeekend ? WEEKEND_UPDATES : WEEKDAY_UPDATES

    const currentHour = now.getUTCHours() + now.getUTCMinutes() / 60

    // Find next update today
    for (const hour of schedule) {
        if (hour > currentHour) {
            const nextUpdate = new Date(now)
            nextUpdate.setUTCHours(Math.floor(hour), (hour % 1) * 60, 0, 0)
            return nextUpdate
        }
    }

    // No more updates today, get first update tomorrow
    const tomorrow = new Date(now)
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
    const tomorrowDayOfWeek = tomorrow.getUTCDay()
    const tomorrowIsWeekend = tomorrowDayOfWeek === 0 || tomorrowDayOfWeek === 6
    const tomorrowSchedule = tomorrowIsWeekend ? WEEKEND_UPDATES : WEEKDAY_UPDATES
    const firstHour = tomorrowSchedule[0]
    tomorrow.setUTCHours(Math.floor(firstHour), (firstHour % 1) * 60, 0, 0)
    return tomorrow
}

function formatTimeUntil(target: Date): string {
    const now = new Date()
    const diffMs = target.getTime() - now.getTime()

    if (diffMs <= 0) return 'agora'

    const diffMins = Math.floor(diffMs / 60000)
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60

    if (hours > 0) {
        return `${hours}h ${mins}min`
    }
    return `${mins}min`
}

function Home() {
    const [matches, setMatches] = useState<Match[]>([])
    const [loading, setLoading] = useState(true)
    const [view, setView] = useState<'agenda' | 'results'>('agenda')
    const [filterEscalao, setFilterEscalao] = useState<string>('Todos')
    const [escaloes, setEscaloes] = useState<string[]>([])
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
    const [timeUntilUpdate, setTimeUntilUpdate] = useState<string>('')

    // Update countdown every minute
    useEffect(() => {
        const updateCountdown = () => {
            const nextUpdate = getNextUpdateTime()
            setTimeUntilUpdate(formatTimeUntil(nextUpdate))
        }

        updateCountdown()
        const interval = setInterval(updateCountdown, 60000) // Update every minute

        return () => clearInterval(interval)
    }, [])

    // Fetch data
    const fetchMatches = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('partidas')
            .select('*')
            .order('data', { ascending: view === 'agenda' })

        if (error) console.error('Error fetching:', error)
        else {
            let sorted = data as Match[]
            if (view === 'results') {
                sorted = sorted.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
            }
            setMatches(sorted)
            setLastUpdate(new Date())

            const uniqueEscaloes = Array.from(new Set(sorted.map(m => m.escalao))).filter(Boolean).sort()
            setEscaloes(uniqueEscaloes)
        }
        setLoading(false)
    }

    // Initial fetch and Realtime subscription
    useEffect(() => {
        fetchMatches()

        const channel = supabase
            .channel('public:partidas')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'partidas' }, () => {
                fetchMatches()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [view])

    // Filter logic
    const filteredMatches = matches.filter(match => {
        if (view === 'agenda') {
            if (match.status === 'FINALIZADO') return false
        } else {
            if (match.status !== 'FINALIZADO') return false
        }

        if (filterEscalao !== 'Todos' && match.escalao !== filterEscalao) return false
        return true
    })

    // Group by Date
    const groupedMatches = filteredMatches.reduce((groups, match) => {
        const date = match.data
        if (!groups[date]) groups[date] = []
        groups[date].push(match)
        return groups
    }, {} as Record<string, Match[]>)

    const sortedDates = Object.keys(groupedMatches).sort((a, b) => {
        return view === 'agenda'
            ? new Date(a).getTime() - new Date(b).getTime()
            : new Date(b).getTime() - new Date(a).getTime()
    })

    const formatDate = (dateStr: string) => {
        const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'long' }
        const date = new Date(dateStr).toLocaleDateString('pt-PT', options)
        return date.charAt(0).toUpperCase() + date.slice(1)
    }

    const formatLastUpdate = () => {
        if (!lastUpdate) return ''
        return lastUpdate.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20">

            {/* Segment Controller */}
            <div className="sticky top-20 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-xl p-1.5 rounded-2xl border border-gray-200 dark:border-white/10 flex gap-1 shadow-xl mx-1 max-w-md mx-auto">
                <button
                    onClick={() => setView('agenda')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${view === 'agenda' ? 'bg-gaia-yellow text-black shadow-lg shadow-yellow-500/20' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'}`}
                >
                    <Calendar size={16} strokeWidth={2.5} />
                    AGENDA
                </button>
                <button
                    onClick={() => setView('results')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${view === 'results' ? 'bg-gray-100 dark:bg-white text-black shadow-lg' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'}`}
                >
                    <Trophy size={16} strokeWidth={2.5} />
                    RESULTADOS
                </button>
            </div>

            {/* Filter */}
            <div className="px-2 max-w-md mx-auto">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Filter size={14} />
                    </div>
                    <select
                        value={filterEscalao}
                        onChange={(e) => setFilterEscalao(e.target.value)}
                        className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-300 text-xs font-medium rounded-lg focus:ring-1 focus:ring-gaia-yellow focus:border-gaia-yellow block w-full pl-9 p-2.5 appearance-none shadow-sm"
                    >
                        <option value="Todos">Todos os Escalões</option>
                        {escaloes.map(e => (
                            <option key={e} value={e}>{e}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Update Info with Countdown */}
            <div className="px-2 max-w-md mx-auto">
                <Link to="/about" className="flex items-center justify-between text-[10px] text-gray-400 uppercase tracking-wide hover:text-gaia-yellow transition-colors group">
                    <div className="flex items-center gap-1.5">
                        <RefreshCw size={10} className="group-hover:animate-spin" />
                        <span>Atualizado: {formatLastUpdate()}</span>
                    </div>
                    <span className="text-gray-500 group-hover:text-gaia-yellow">Próxima: {timeUntilUpdate}</span>
                </Link>
            </div>

            {/* Content List */}
            {loading ? (
                <div className="flex justify-center py-32">
                    <Loader2 className="animate-spin text-gaia-yellow" size={32} />
                </div>
            ) : (
                <div className="space-y-8 px-1">
                    {sortedDates.length === 0 ? (
                        <div className="text-center py-20 text-gray-600 font-medium">
                            Nenhum jogo encontrado.
                        </div>
                    ) : (
                        sortedDates.map(date => (
                            <div key={date} className="animate-in fade-in slide-in-from-bottom-2 duration-500">

                                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-500 mb-3 uppercase tracking-widest pl-2">
                                    {formatDate(date)}
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {groupedMatches[date].map(match => (
                                        <Link to={`/game/${match.slug}`} key={match.slug} className="glass-card flex flex-col gap-0 group active:scale-[0.98] hover:border-gaia-yellow/30">

                                            <div className="flex justify-between items-center p-4 pb-2 border-b border-gray-100 dark:border-white/5">
                                                <div className="flex items-center gap-2 text-gaia-yellow">
                                                    {view === 'agenda' ? (
                                                        <>
                                                            <Clock size={12} strokeWidth={3} />
                                                            <span className="text-xs font-mono font-bold tracking-wider">
                                                                {(match.hora || '00:00').slice(0, 5)}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-gray-400">FIN</span>
                                                    )}
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                                    {match.escalao}
                                                </span>
                                            </div>

                                            <div className="p-4 flex flex-col gap-3">
                                                <div className={`flex items-center justify-between ${match.resultado_casa !== null && match.resultado_fora !== null && match.resultado_casa < match.resultado_fora ? 'opacity-60 grayscale' : 'opacity-100'}`}>
                                                    <div className="flex items-center gap-3">
                                                        {match.logotipo_casa ? (
                                                            <img src={match.logotipo_casa} alt={match.equipa_casa} className="w-8 h-8 object-contain" />
                                                        ) : (
                                                            <div className="w-8 h-8 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center">
                                                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{match.equipa_casa.substring(0, 1)}</span>
                                                            </div>
                                                        )}
                                                        <span className="text-sm font-bold text-gray-900 dark:text-white leading-tight truncate max-w-[120px]">
                                                            {match.equipa_casa}
                                                        </span>
                                                    </div>
                                                    {view === 'results' && match.resultado_casa !== null && (
                                                        <span className={`text-xl font-mono font-bold ${match.resultado_casa > (match.resultado_fora || 0) ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                                                            {match.resultado_casa}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className={`flex items-center justify-between ${match.resultado_casa !== null && match.resultado_fora !== null && match.resultado_fora < match.resultado_casa ? 'opacity-60 grayscale' : 'opacity-100'}`}>
                                                    <div className="flex items-center gap-3">
                                                        {match.logotipo_fora ? (
                                                            <img src={match.logotipo_fora} alt={match.equipa_fora} className="w-8 h-8 object-contain" />
                                                        ) : (
                                                            <div className="w-8 h-8 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center">
                                                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{match.equipa_fora.substring(0, 1)}</span>
                                                            </div>
                                                        )}
                                                        <span className="text-sm font-bold text-gray-900 dark:text-white leading-tight truncate max-w-[120px]">
                                                            {match.equipa_fora}
                                                        </span>
                                                    </div>
                                                    {view === 'results' && match.resultado_fora !== null && (
                                                        <span className={`text-xl font-mono font-bold ${match.resultado_fora > (match.resultado_casa || 0) ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                                                            {match.resultado_fora}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="px-4 pb-4 pt-0 flex justify-between items-center text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                                                <div className="flex items-center gap-1.5 truncate max-w-[70%] text-gray-400">
                                                    {match.local ? (
                                                        <>
                                                            <MapPin size={10} className="shrink-0 text-gaia-yellow" />
                                                            <span className="truncate">{match.local}</span>
                                                        </>
                                                    ) : (
                                                        <span>{match.competicao}</span>
                                                    )}
                                                </div>

                                                {match.status === 'A DECORRER' && (
                                                    <span className="text-red-500 font-bold flex items-center gap-1 animate-pulse">
                                                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                                        LIVE
                                                    </span>
                                                )}

                                                <ChevronRight size={14} className="text-gray-400 group-hover:text-gaia-yellow transition-colors" />
                                            </div>

                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}

export default Home
