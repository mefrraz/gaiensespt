import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Calendar, Trophy, Filter, Loader2, RefreshCw, ChevronRight } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'

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

// Update schedule helpers (reused)


function Games() {
    const [matches, setMatches] = useState<Match[]>([])
    const [loading, setLoading] = useState(true)
    const [searchParams, setSearchParams] = useSearchParams()

    // Explicitly typed state
    const [view, setView] = useState<'agenda' | 'results'>(() => {
        const v = searchParams.get('view')
        return v === 'results' ? 'results' : 'agenda'
    })

    const [filterEscalao, setFilterEscalao] = useState<string>('Todos')
    const [escaloes, setEscaloes] = useState<string[]>([])
    const [lastScrape, setLastScrape] = useState<string>('')


    // Sync URL with view
    useEffect(() => {
        setSearchParams({ view })
    }, [view, setSearchParams])

    // Update countdown
    useEffect(() => {
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

        fetchLastScrape()

        // Realtime subscription for metadata
        const channel = supabase
            .channel('public:metadata')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'metadata' }, () => {
                fetchLastScrape()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    // Fetch matches based on view
    useEffect(() => {
        const fetchMatches = async () => {
            setLoading(true)

            let query = supabase
                .from('games_2025_2026')
                .select('*')

            if (view === 'agenda') {
                query = query.neq('status', 'FINALIZADO').order('data', { ascending: true }).order('hora', { ascending: true })
            } else {
                query = query.eq('status', 'FINALIZADO').order('data', { ascending: false })
            }

            const { data, error } = await query

            if (error) {
                console.error('Error fetching games', error)
                setMatches([])
                setEscaloes([])
            } else {
                setMatches(data as Match[])
                const uniqueEscaloes = Array.from(new Set(data.map((m: Match) => m.escalao))).filter(Boolean).sort()
                setEscaloes(uniqueEscaloes)
            }
            setLoading(false)
        }

        fetchMatches()

        const channel = supabase
            .channel(`public:games:${view}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'games_2025_2026' }, () => {
                fetchMatches()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [view])

    // Filter logic
    const filteredMatches = matches.filter(match => {
        if (filterEscalao !== 'Todos' && match.escalao !== filterEscalao) return false
        return true
    })

    // Group by Date for cleaner list headers
    const groupedMatches = filteredMatches.reduce((groups, match) => {
        const date = match.data
        if (!groups[date]) groups[date] = []
        groups[date].push(match)
        return groups
    }, {} as Record<string, Match[]>)

    // Sort Dates
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

    const formatTeamName = (name: string) => name



    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-24">

            {/* Segment Controller - Keep as is */}
            <div className="sticky top-20 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-1.5 rounded-2xl border border-zinc-200 dark:border-white/10 flex gap-1 shadow-xl mx-2 max-w-sm mx-auto mt-4">
                <button
                    onClick={() => setView('agenda')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${view === 'agenda' ? 'bg-gaia-yellow text-black shadow-lg shadow-yellow-500/20' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
                >
                    <Calendar size={14} strokeWidth={2.5} />
                    AGENDA
                </button>
                <button
                    onClick={() => setView('results')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${view === 'results' ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
                >
                    <Trophy size={14} strokeWidth={2.5} />
                    RESULTADOS
                </button>
            </div>

            {/* Filters */}
            <div className="px-4 max-w-sm mx-auto flex gap-2">
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

            {/* Update Info Link */}
            <div className="px-4 text-center">
                <Link to="/about" className="inline-flex items-center gap-1.5 text-[10px] text-zinc-400 uppercase tracking-wide hover:text-gaia-yellow transition-colors group">
                    <RefreshCw size={10} className="group-hover:animate-spin" />
                    <span>Atualizado: {lastScrape || '--:--'}</span>
                </Link>
            </div>

            {/* List View Content */}
            {loading ? (
                <div className="flex justify-center py-32">
                    <Loader2 className="animate-spin text-gaia-yellow" size={32} />
                </div>
            ) : (
                <div className="space-y-8 px-2 md:px-4">
                    {sortedDates.length === 0 ? (
                        <div className="text-center py-20 text-zinc-600 font-medium">
                            {view === 'agenda' ? 'Nenhum jogo agendado.' : 'Nenhum resultado encontrado.'}
                        </div>
                    ) : (
                        sortedDates.map(date => (
                            <div key={date} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <h3 className="sticky top-[7.5rem] z-30 bg-zinc-50/95 dark:bg-zinc-950/95 backdrop-blur-sm py-2 px-4 shadow-sm text-xs font-bold text-zinc-500 uppercase tracking-widest border-y border-zinc-200 dark:border-white/5 -mx-4 md:mx-0 md:rounded-lg md:border mb-2">
                                    {formatDate(date)}
                                </h3>
                                <div className="space-y-2">
                                    {groupedMatches[date].map(match => {
                                        const isHomeWinner = view === 'results' && match.resultado_casa !== null && match.resultado_fora !== null && match.resultado_casa > match.resultado_fora;
                                        const isAwayWinner = view === 'results' && match.resultado_casa !== null && match.resultado_fora !== null && match.resultado_fora > match.resultado_casa;

                                        return (
                                            <Link to={`/game/${match.slug}`} key={match.slug} className="block group">
                                                <div className="bg-white dark:bg-zinc-900 rounded-xl p-3 border border-zinc-100 dark:border-white/5 shadow-sm hover:border-gaia-yellow/50 transition-all flex items-center gap-4">

                                                    {/* Time / Status Column */}
                                                    <div className="flex flex-col items-center justify-center w-12 shrink-0 border-r border-zinc-100 dark:border-white/5 pr-4">
                                                        {view === 'agenda' ? (
                                                            <>
                                                                <span className="text-sm font-bold text-zinc-900 dark:text-white">
                                                                    {(match.hora || '00:00').slice(0, 5)}
                                                                </span>
                                                                {match.status === 'A DECORRER' && (
                                                                    <span className="text-[9px] font-bold text-red-500 animate-pulse">LIVE</span>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                                                        )}
                                                    </div>

                                                    {/* Central Info: Teams & Score */}
                                                    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                                                        {/* Home Team */}
                                                        <div className="flex items-center justify-between gap-3">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                {match.logotipo_casa ? (
                                                                    <img src={match.logotipo_casa} className="w-5 h-5 object-contain" />
                                                                ) : (
                                                                    <div className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-white/10 flex items-center justify-center">
                                                                        <span className="text-[8px] font-bold text-zinc-500">{match.equipa_casa.charAt(0)}</span>
                                                                    </div>
                                                                )}
                                                                <span className={`text-sm truncate ${isHomeWinner ? 'font-bold text-zinc-900 dark:text-white' : 'font-medium text-zinc-600 dark:text-zinc-400'}`}>
                                                                    {formatTeamName(match.equipa_casa)}
                                                                </span>
                                                            </div>
                                                            {/* Score */}
                                                            {view === 'results' && match.resultado_casa !== null && (
                                                                <span className={`text-sm font-mono ${isHomeWinner ? 'font-bold text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>
                                                                    {match.resultado_casa}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Away Team */}
                                                        <div className="flex items-center justify-between gap-3">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                {match.logotipo_fora ? (
                                                                    <img src={match.logotipo_fora} className="w-5 h-5 object-contain" />
                                                                ) : (
                                                                    <div className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-white/10 flex items-center justify-center">
                                                                        <span className="text-[8px] font-bold text-zinc-500">{match.equipa_fora.charAt(0)}</span>
                                                                    </div>
                                                                )}
                                                                <span className={`text-sm truncate ${isAwayWinner ? 'font-bold text-zinc-900 dark:text-white' : 'font-medium text-zinc-600 dark:text-zinc-400'}`}>
                                                                    {formatTeamName(match.equipa_fora)}
                                                                </span>
                                                            </div>
                                                            {/* Score */}
                                                            {view === 'results' && match.resultado_fora !== null && (
                                                                <span className={`text-sm font-mono ${isAwayWinner ? 'font-bold text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>
                                                                    {match.resultado_fora}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Right: Category / Arrow */}
                                                    <div className="hidden sm:flex flex-col items-end gap-1 min-w-[100px] border-l border-zinc-100 dark:border-white/5 pl-4 py-1">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 text-right">
                                                            {match.escalao}
                                                        </span>
                                                        {match.local && (
                                                            <span className="text-[10px] text-zinc-400 truncate max-w-[120px] text-right">
                                                                {match.local}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Mobile Arrow */}
                                                    <div className="sm:hidden text-zinc-300">
                                                        <ChevronRight size={16} />
                                                    </div>
                                                </div>
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}

export default Games
