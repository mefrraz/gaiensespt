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
    epoca?: string
}



// Update schedule (in UTC hours)
const WEEKDAY_UPDATES = [12, 18, 22] // Mon-Thu
const FRIDAY_START = 16
const FRIDAY_END = 24
const FRIDAY_INTERVAL_MINS = 30
const WEEKEND_UPDATES_START = 10
const WEEKEND_UPDATES_END = 24
const WEEKEND_INTERVAL_MINS = 15

function getNextUpdateTime(): Date {
    const now = new Date()
    const dayOfWeek = now.getUTCDay() // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const isFriday = dayOfWeek === 5

    const currentHour = now.getUTCHours() + now.getUTCMinutes() / 60
    const totalMins = now.getUTCHours() * 60 + now.getUTCMinutes()

    if (isWeekend) {
        // Sat-Sun: 10:00-24:00 every 15 min
        if (currentHour < WEEKEND_UPDATES_START) {
            const next = new Date(now)
            next.setUTCHours(WEEKEND_UPDATES_START, 0, 0, 0)
            return next
        }
        if (currentHour >= WEEKEND_UPDATES_END) {
            // Next day
            const tomorrow = new Date(now)
            tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
            const tomorrowDow = tomorrow.getUTCDay()
            if (tomorrowDow === 0 || tomorrowDow === 6) {
                tomorrow.setUTCHours(WEEKEND_UPDATES_START, 0, 0, 0)
            } else {
                tomorrow.setUTCHours(WEEKDAY_UPDATES[0], 0, 0, 0)
            }
            return tomorrow
        }
        // Find next 15-min slot
        const nextSlotMins = Math.ceil(totalMins / WEEKEND_INTERVAL_MINS) * WEEKEND_INTERVAL_MINS
        const next = new Date(now)
        next.setUTCHours(Math.floor(nextSlotMins / 60) % 24, nextSlotMins % 60, 0, 0)
        return next
    } else if (isFriday) {
        // Friday: 16:00-24:00 every 30 min
        if (currentHour < FRIDAY_START) {
            const next = new Date(now)
            next.setUTCHours(FRIDAY_START, 0, 0, 0)
            return next
        }
        if (currentHour >= FRIDAY_END) {
            // Saturday
            const tomorrow = new Date(now)
            tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
            tomorrow.setUTCHours(WEEKEND_UPDATES_START, 0, 0, 0)
            return tomorrow
        }
        // Find next 30-min slot
        const nextSlotMins = Math.ceil(totalMins / FRIDAY_INTERVAL_MINS) * FRIDAY_INTERVAL_MINS
        const next = new Date(now)
        next.setUTCHours(Math.floor(nextSlotMins / 60) % 24, nextSlotMins % 60, 0, 0)
        return next
    } else {
        // Mon-Thu: 12:00, 18:00, 22:00
        for (const hour of WEEKDAY_UPDATES) {
            if (hour > currentHour) {
                const next = new Date(now)
                next.setUTCHours(hour, 0, 0, 0)
                return next
            }
        }
        // Tomorrow
        const tomorrow = new Date(now)
        tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
        const tomorrowDow = tomorrow.getUTCDay()
        if (tomorrowDow === 5) {
            tomorrow.setUTCHours(FRIDAY_START, 0, 0, 0)
        } else if (tomorrowDow === 0 || tomorrowDow === 6) {
            tomorrow.setUTCHours(WEEKEND_UPDATES_START, 0, 0, 0)
        } else {
            tomorrow.setUTCHours(WEEKDAY_UPDATES[0], 0, 0, 0)
        }
        return tomorrow
    }
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
    const [lastScrape, setLastScrape] = useState<string>('')
    const [timeUntilUpdate, setTimeUntilUpdate] = useState<string>('')


    // Fetch last scrape time from metadata
    const fetchLastScrape = async () => {
        const { data, error } = await supabase
            .from('metadata')
            .select('value')
            .eq('key', 'last_scrape')
            .single()

        if (!error && data) {
            const scrapeDate = new Date(data.value)
            setLastScrape(scrapeDate.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }))
        }
    }



    // Update countdown every minute
    useEffect(() => {
        const updateCountdown = () => {
            const nextUpdate = getNextUpdateTime()
            setTimeUntilUpdate(formatTimeUntil(nextUpdate))
        }

        updateCountdown()
        const interval = setInterval(updateCountdown, 60000)

        return () => clearInterval(interval)
    }, [])

    // Fetch data
    const fetchMatches = async () => {
        setLoading(true)

        // Fetch games for CURRENT SEASON ONLY (2025/2026)
        const { data, error } = await supabase
            .from('games_2025_2026')
            .select('*')
            .order('data', { ascending: view === 'agenda' })

        if (error) {
            console.error('Error fetching from games', error)
            setMatches([])
            setEscaloes([])
        } else {
            let sorted = data as Match[]
            // Client-side sort to be double sure
            if (view === 'results') {
                sorted = sorted.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
            } else {
                sorted = sorted.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
            }
            setMatches(sorted)

            const uniqueEscaloes = Array.from(new Set(sorted.map(m => m.escalao))).filter(Boolean).sort()
            setEscaloes(uniqueEscaloes)
        }
        setLoading(false)
    }

    // Initial fetch and Realtime subscription
    useEffect(() => {
        fetchMatches()
        fetchLastScrape()

        const channel = supabase
            .channel('public:games')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'games_2025_2026' }, () => {
                fetchMatches()
                fetchLastScrape()
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

    const formatTeamName = (name: string, escalao: string) => {
        const uName = name.toUpperCase()
        if (uName.includes('FC GAIA') || uName.includes('GAIA')) {
            // Simplify Gaia names
            let suffix = ''
            if (uName.includes(' A') || uName.endsWith(' A')) suffix = ' A'
            else if (uName.includes(' B') || uName.endsWith(' B')) suffix = ' B'
            else if (uName.includes(' C') || uName.endsWith(' C')) suffix = ' C'

            const uEscalao = escalao.toUpperCase()
            if (uEscalao.includes('SUB14') || uEscalao.includes('SUB 14')) return `Sub14${suffix}`
            if (uEscalao.includes('SUB16') || uEscalao.includes('SUB 16')) return `Sub16${suffix}`
            if (uEscalao.includes('SUB18') || uEscalao.includes('SUB 18')) return `Sub18${suffix}`
            if (uEscalao.includes('SENIORES') || uEscalao.includes('SÉNIOR')) return `Seniores${suffix}`

            // Fallback
            return `Gaia${suffix}`
        }
        return name
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20">

            {/* Segment Controller */}
            <div className="sticky top-20 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-xl p-1.5 rounded-2xl border border-zinc-200 dark:border-white/10 flex gap-1 shadow-xl mx-1 max-w-md mx-auto">
                <button
                    onClick={() => setView('agenda')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${view === 'agenda' ? 'bg-gaia-yellow text-black shadow-lg shadow-yellow-500/20' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
                >
                    <Calendar size={14} strokeWidth={2.5} />
                    AGENDA
                </button>
                <button
                    onClick={() => setView('results')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${view === 'results' ? 'bg-zinc-100 dark:bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
                >
                    <Trophy size={14} strokeWidth={2.5} />
                    RESULTADOS
                </button>

            </div>

            {/* Filters Row */}
            <div className="px-2 max-w-md mx-auto flex gap-2">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                        <Filter size={14} />
                    </div>
                    <select
                        value={filterEscalao}
                        onChange={(e) => setFilterEscalao(e.target.value)}
                        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-zinc-800 dark:text-zinc-300 text-xs font-medium rounded-lg focus:ring-1 focus:ring-gaia-yellow focus:border-gaia-yellow block w-full pl-9 p-2.5 appearance-none shadow-sm"
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
                <Link to="/about" className="flex items-center justify-between text-[10px] text-zinc-400 uppercase tracking-wide hover:text-gaia-yellow transition-colors group">
                    <div className="flex items-center gap-1.5">
                        <RefreshCw size={10} className="group-hover:animate-spin" />
                        <span>Atualizado: {lastScrape || '--:--'}</span>
                    </div>
                    <span className="text-zinc-500 group-hover:text-gaia-yellow">Próxima: {timeUntilUpdate}</span>
                </Link>
            </div>


            {/* Content List */}
            {
                loading ? (
                    <div className="flex justify-center py-32">
                        <Loader2 className="animate-spin text-gaia-yellow" size={32} />
                    </div>
                ) : (
                    <div className="space-y-8 px-1">
                        {sortedDates.length === 0 ? (
                            <div className="text-center py-20 text-zinc-600 font-medium">
                                Nenhum jogo encontrado.
                            </div>
                        ) : (
                            sortedDates.map(date => (
                                <div key={date} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-500 mb-3 uppercase tracking-widest pl-2">
                                        {formatDate(date)}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {groupedMatches[date].map(match => (
                                            <Link to={`/game/${match.slug}`} key={match.slug} className="glass-card flex flex-col gap-0 group active:scale-[0.98] hover:border-gaia-yellow/30">
                                                <div className="flex justify-between items-center p-4 pb-2 border-b border-zinc-100 dark:border-white/5">
                                                    <div className="flex items-center gap-2 text-gaia-yellow">
                                                        {view === 'agenda' ? (
                                                            <>
                                                                <Clock size={12} strokeWidth={3} />
                                                                <span className="text-xs font-mono font-bold tracking-wider">
                                                                    {(match.hora || '00:00').slice(0, 5)}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="text-[10px] font-bold text-zinc-400">FIN</span>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                                                        {match.escalao}
                                                    </span>
                                                </div>
                                                <div className="p-4 flex flex-col gap-3">
                                                    <div className={`flex items-center justify-between ${match.resultado_casa !== null && match.resultado_fora !== null && match.resultado_casa < match.resultado_fora ? 'opacity-60 grayscale' : 'opacity-100'}`}>
                                                        <div className="flex items-center gap-3">
                                                            {match.logotipo_casa ? (
                                                                <img src={match.logotipo_casa} alt={match.equipa_casa} className="w-8 h-8 object-contain" />
                                                            ) : (
                                                                <div className="w-8 h-8 bg-zinc-100 dark:bg-white/10 rounded-full flex items-center justify-center">
                                                                    <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">{match.equipa_casa.substring(0, 1)}</span>
                                                                </div>
                                                            )}
                                                            <span className="text-sm font-bold text-zinc-900 dark:text-white leading-tight truncate max-w-[120px]">
                                                                {formatTeamName(match.equipa_casa, match.escalao)}
                                                            </span>
                                                        </div>
                                                        {view === 'results' && match.resultado_casa !== null && (
                                                            <span className={`text-xl font-mono font-bold ${match.resultado_casa > (match.resultado_fora || 0) ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>
                                                                {match.resultado_casa}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className={`flex items-center justify-between ${match.resultado_casa !== null && match.resultado_fora !== null && match.resultado_fora < match.resultado_casa ? 'opacity-60 grayscale' : 'opacity-100'}`}>
                                                        <div className="flex items-center gap-3">
                                                            {match.logotipo_fora ? (
                                                                <img src={match.logotipo_fora} alt={match.equipa_fora} className="w-8 h-8 object-contain" />
                                                            ) : (
                                                                <div className="w-8 h-8 bg-zinc-100 dark:bg-white/10 rounded-full flex items-center justify-center">
                                                                    <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">{match.equipa_fora.substring(0, 1)}</span>
                                                                </div>
                                                            )}
                                                            <span className="text-sm font-bold text-zinc-900 dark:text-white leading-tight truncate max-w-[120px]">
                                                                {formatTeamName(match.equipa_fora, match.escalao)}
                                                            </span>
                                                        </div>
                                                        {view === 'results' && match.resultado_fora !== null && (
                                                            <span className={`text-xl font-mono font-bold ${match.resultado_fora > (match.resultado_casa || 0) ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>
                                                                {match.resultado_fora}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="px-4 pb-4 pt-0 flex justify-between items-center text-[10px] font-medium text-zinc-500 uppercase tracking-wide">
                                                    <div className="flex items-center gap-1.5 truncate max-w-[70%] text-zinc-400">
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
                                                    <ChevronRight size={14} className="text-zinc-400 group-hover:text-gaia-yellow transition-colors" />
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )
            }
        </div >
    )
}

export default Home
