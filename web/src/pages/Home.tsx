import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Calendar, Trophy, Filter, Loader2, MapPin, ChevronRight, Clock } from 'lucide-react'
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
    status: 'AGENDADO' | 'A DECORRER' | 'FINALIZADO'
}

function Home() {
    const [matches, setMatches] = useState<Match[]>([])
    const [loading, setLoading] = useState(true)
    const [view, setView] = useState<'agenda' | 'results'>('agenda')
    const [filterEscalao, setFilterEscalao] = useState<string>('Todos')
    const [escaloes, setEscaloes] = useState<string[]>([])

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
                fetchMatches() // Re-fetch on any change
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

    // Group by Date for cleaner UI
    const groupedMatches = filteredMatches.reduce((groups, match) => {
        const date = match.data
        if (!groups[date]) groups[date] = []
        groups[date].push(match)
        return groups
    }, {} as Record<string, Match[]>)

    // Sort dates
    const sortedDates = Object.keys(groupedMatches).sort((a, b) => {
        return view === 'agenda'
            ? new Date(a).getTime() - new Date(b).getTime()
            : new Date(b).getTime() - new Date(a).getTime()
    })

    // Format Date Helper
    const formatDate = (dateStr: string) => {
        const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'long' }
        const date = new Date(dateStr).toLocaleDateString('pt-PT', options)
        return date.charAt(0).toUpperCase() + date.slice(1)
    }

    return (
        <div className="max-w-md mx-auto space-y-6 pb-20">

            {/* Mobile-first Header / Segment Controller */}
            <div className="sticky top-20 z-40 bg-black/80 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 flex gap-1 shadow-2xl mx-1">
                <button
                    onClick={() => setView('agenda')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${view === 'agenda' ? 'bg-gaia-yellow text-black shadow-lg shadow-yellow-500/20' : 'text-gray-500 hover:text-gray-300'
                        }`}
                >
                    <Calendar size={16} strokeWidth={2.5} />
                    AGENDA
                </button>
                <button
                    onClick={() => setView('results')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${view === 'results' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-gray-300'
                        }`}
                >
                    <Trophy size={16} strokeWidth={2.5} />
                    RESULTADOS
                </button>
            </div>

            {/* Filter Toggle - simplified for mobile */}
            <div className="px-2">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Filter size={14} />
                    </div>
                    <select
                        value={filterEscalao}
                        onChange={(e) => setFilterEscalao(e.target.value)}
                        className="bg-[#111] border border-white/10 text-gray-300 text-xs font-medium rounded-lg focus:ring-1 focus:ring-gaia-yellow focus:border-gaia-yellow block w-full pl-9 p-2.5 appearance-none"
                    >
                        <option value="Todos">Todos os Escalões</option>
                        {escaloes.map(e => (
                            <option key={e} value={e}>{e}</option>
                        ))}
                    </select>
                </div>
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

                                <h3 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-widest pl-2">
                                    {formatDate(date)}
                                </h3>

                                <div className="space-y-3">
                                    {groupedMatches[date].map(match => (
                                        <Link to={`/game/${match.slug}`} key={match.slug} className="glass-card flex flex-col gap-0 group active:scale-[0.98]">

                                            {/* Header: Time & Competition */}
                                            <div className="flex justify-between items-center p-4 pb-2 border-b border-white/5">
                                                <div className="flex items-center gap-2 text-gaia-yellow">
                                                    <Clock size={12} strokeWidth={3} />
                                                    <span className="text-xs font-mono font-bold tracking-wider">
                                                        {(match.hora || '00:00').slice(0, 5)}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                                    {match.escalao}
                                                </span>
                                            </div>

                                            {/* Main: Teams & Scores */}
                                            <div className="p-4 flex justify-between items-center gap-4">
                                                {/* Home */}
                                                <div className={`flex flex-col flex-1 ${match.resultado_casa !== null && match.resultado_fora !== null && match.resultado_casa > match.resultado_fora ? 'opacity-100' : 'opacity-70'}`}>
                                                    <span className="text-sm font-bold text-white leading-tight mb-1 truncate">
                                                        {match.equipa_casa}
                                                    </span>
                                                    {view === 'results' && (
                                                        <span className="text-2xl font-mono font-bold text-white tracking-tighter">
                                                            {match.resultado_casa}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Divider / VS */}
                                                <div className="flex flex-col items-center justify-center opacity-20">
                                                    <div className="h-8 w-[1px] bg-white"></div>
                                                </div>

                                                {/* Away */}
                                                <div className={`flex flex-col flex-1 items-end text-right ${match.resultado_casa !== null && match.resultado_fora !== null && match.resultado_fora > match.resultado_casa ? 'opacity-100' : 'opacity-70'}`}>
                                                    <span className="text-sm font-bold text-white leading-tight mb-1 truncate">
                                                        {match.equipa_fora}
                                                    </span>
                                                    {view === 'results' && (
                                                        <span className="text-2xl font-mono font-bold text-white tracking-tighter">
                                                            {match.resultado_fora}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Footer: Status / Location */}
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

                                                <ChevronRight size={14} className="text-gray-700 group-hover:text-gaia-yellow transition-colors" />
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
