import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Filter, Loader2, MapPin, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Match } from './Home'

function Results() {
    const [matches, setMatches] = useState<Match[]>([])
    const [loading, setLoading] = useState(true)
    const [filterEscalao, setFilterEscalao] = useState<string>('Todos')
    const [escaloes, setEscaloes] = useState<string[]>([])

    // Fetch data
    const fetchMatches = async () => {
        setLoading(true)

        // Fetch games for CURRENT SEASON ONLY (2025/2026) -> FINALIZADO
        const { data, error } = await supabase
            .from('games_2025_2026')
            .select('*')
            .eq('status', 'FINALIZADO')
            .order('data', { ascending: false }) // Most recent first

        if (error) {
            console.error('Error fetching results', error)
            setMatches([])
            setEscaloes([])
        } else {
            setMatches(data as Match[])

            const uniqueEscaloes = Array.from(new Set(data.map((m: Match) => m.escalao))).filter(Boolean).sort()
            setEscaloes(uniqueEscaloes)
        }
        setLoading(false)
    }

    // Initial fetch and Realtime subscription
    useEffect(() => {
        fetchMatches()

        const channel = supabase
            .channel('public:games:results')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'games_2025_2026' }, () => {
                fetchMatches()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    // Filter logic
    const filteredMatches = matches.filter(match => {
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
        return new Date(b).getTime() - new Date(a).getTime() // Descending
    })

    const formatDate = (dateStr: string) => {
        const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'long' }
        const date = new Date(dateStr).toLocaleDateString('pt-PT', options)
        return date.charAt(0).toUpperCase() + date.slice(1)
    }

    const formatTeamName = (name: string) => {
        return name.toUpperCase() // Keep consistent
    }

    const isGaiaWin = (match: Match) => {
        if (match.resultado_casa === null || match.resultado_fora === null) return null
        const gaiaHome = match.equipa_casa.toUpperCase().includes('GAIA')
        if (gaiaHome) {
            return match.resultado_casa > match.resultado_fora
        }
        return match.resultado_fora > match.resultado_casa
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-24">

            {/* Page Header */}
            <div className="flex items-center justify-between px-2 pt-2">
                <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Resultados</h1>
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
                                Nenhum resultado encontrado.
                            </div>
                        ) : (
                            sortedDates.map(date => (
                                <div key={date} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-500 mb-3 uppercase tracking-widest pl-2">
                                        {formatDate(date)}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {groupedMatches[date].map(match => {
                                            const won = isGaiaWin(match)
                                            return (
                                                <Link to={`/game/${match.slug}`} key={match.slug} className="glass-card flex flex-col gap-0 group active:scale-[0.98] hover:border-gaia-yellow/30">
                                                    <div className="flex justify-between items-center p-4 pb-2 border-b border-zinc-100 dark:border-white/5">
                                                        <div className="flex items-center gap-2">
                                                            {won === true && <TrendingUp size={14} className="text-green-500" />}
                                                            {won === false && <TrendingDown size={14} className="text-red-500" />}
                                                            {won === null && <Minus size={14} className="text-zinc-400" />}
                                                            <span className="text-[10px] font-bold text-zinc-400">FIN</span>
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
                                                                    {formatTeamName(match.equipa_casa)}
                                                                </span>
                                                            </div>
                                                            {match.resultado_casa !== null && (
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
                                                                    {formatTeamName(match.equipa_fora)}
                                                                </span>
                                                            </div>
                                                            {match.resultado_fora !== null && (
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
                                                        <ChevronRight size={14} className="text-zinc-400 group-hover:text-gaia-yellow transition-colors" />
                                                    </div>
                                                </Link>
                                            )
                                        })}
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

export default Results
