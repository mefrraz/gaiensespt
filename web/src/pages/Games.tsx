import { useState, useEffect } from 'react'
import { Calendar, Trophy, Filter, MapPin, ChevronRight, Clock, RefreshCw, AlertCircle } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { useGames } from '../hooks/useGames'
import { useTimeAgo } from '../hooks/useTimeAgo'
import { SkeletonGrid } from '../components/Skeleton'
import { EmptyState } from '../components/EmptyState'
import { Match } from '../components/types'

function Games() {
    const [searchParams, setSearchParams] = useSearchParams()

    const [view, setView] = useState<'agenda' | 'results'>(() => {
        const v = searchParams.get('view')
        return v === 'results' ? 'results' : 'agenda'
    })

    const [filterEscalao, setFilterEscalao] = useState<string>('Todos')
    const [escaloes, setEscaloes] = useState<string[]>([])

    const { games: allGames, loading, lastUpdated, error, refresh } = useGames('2025/2026', 119)

    const matches = allGames || []
    const timeAgo = useTimeAgo(lastUpdated)

    useEffect(() => {
        setSearchParams({ view })
    }, [view, setSearchParams])

    useEffect(() => {
        const uniqueEscaloes = Array.from(new Set(matches.map(m => m.escalao))).filter(Boolean).sort()
        setEscaloes(uniqueEscaloes)
    }, [matches])

    const filteredMatches = matches.filter(match => {
        if (view === 'agenda' && match.status === 'FINALIZADO') return false
        if (view === 'results' && match.status !== 'FINALIZADO') return false
        if (filterEscalao !== 'Todos' && match.escalao !== filterEscalao) return false
        return true
    })

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

    return (
        <div className="max-w-6xl mx-auto space-y-4 pb-24">
            {/* Header */}
            <div className="px-3 pt-4">
                <h1 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    {view === 'agenda' ? <Calendar size={18} className="text-gaia-yellow" /> : <Trophy size={18} className="text-gaia-yellow" />}
                    {view === 'agenda' ? 'Agenda' : 'Resultados'}
                </h1>
            </div>

            {/* Segment */}
            <div className="sticky top-16 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-xl p-1.5 rounded-2xl border border-zinc-200 dark:border-white/10 flex gap-1 shadow-xl max-w-sm mx-auto">
                <button
                    onClick={() => setView('agenda')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${view === 'agenda' ? 'bg-gaia-yellow text-black shadow-lg shadow-yellow-500/20' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
                >
                    <Calendar size={14} strokeWidth={2.5} />
                    AGENDA
                </button>
                <button
                    onClick={() => setView('results')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${view === 'results' ? 'bg-zinc-100 dark:bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
                >
                    <Trophy size={14} strokeWidth={2.5} />
                    RESULTADOS
                </button>
            </div>

            {/* Filtro */}
            <div className="px-3 max-w-sm mx-auto">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
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

            {/* Error banner */}
            {error && !loading && (
                <div className="px-3 max-w-lg mx-auto">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <AlertCircle size={14} className="text-red-500 shrink-0" />
                        <span className="text-xs text-red-600 dark:text-red-400 flex-1">{error}</span>
                        <button
                            onClick={() => refresh()}
                            className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline shrink-0"
                        >
                            Tentar novamente
                        </button>
                    </div>
                </div>
            )}

            {/* Atualizado */}
            <div className="px-3 max-w-md mx-auto">
                <Link to="/about" className="flex items-center text-[10px] text-zinc-500 dark:text-zinc-500 uppercase tracking-wide hover:text-gaia-yellow transition-colors group">
                    <div className="flex items-center gap-1.5">
                        <RefreshCw size={10} className="group-hover:animate-spin" />
                        <span>Atualizado: {timeAgo || '--'}</span>
                    </div>
                </Link>
            </div>

            {/* Loading */}
            {loading && <SkeletonGrid count={6} />}

            {/* Error + empty (no cached data) */}
            {!loading && error && matches.length === 0 && (
                <EmptyState
                    icon="error"
                    title="Erro ao carregar"
                    subtitle={error}
                    action={{ label: 'Tentar novamente', onClick: () => refresh() }}
                />
            )}

            {/* Empty state */}
            {!loading && !error && sortedDates.length === 0 && (
                <EmptyState view={view} />
            )}

            {/* Games grid */}
            {!loading && sortedDates.length > 0 && (
                <div className="space-y-6 px-2 md:px-4">
                    {sortedDates.map(date => (
                        <div key={date} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="flex items-center gap-3 mb-3 px-2">
                                <h3 className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">
                                    {formatDate(date)}
                                </h3>
                                <div className="flex-1 h-px bg-zinc-200 dark:bg-white/5" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {groupedMatches[date].map(match => {
                                    const matchSlug = match.slug || `${match.data}-${match.equipa_casa.toLowerCase().replace(/\s+/g, '-')}-${match.equipa_fora.toLowerCase().replace(/\s+/g, '-')}`
                                    const isGaiaWin = match.resultado_casa !== null && match.resultado_fora !== null && (
                                        (match.equipa_casa.toUpperCase().includes('GAIA') && match.resultado_casa > match.resultado_fora) ||
                                        (match.equipa_fora.toUpperCase().includes('GAIA') && match.resultado_fora > match.resultado_casa)
                                    )
                                    const gaiaLost = match.resultado_casa !== null && match.resultado_fora !== null && !isGaiaWin
                                    return (
                                        <Link to={`/game/${matchSlug}`} key={matchSlug} className="glass-card flex flex-col gap-0 group active:scale-[0.98] hover:border-gaia-yellow/30 transition-all duration-200">
                                            <div className="flex justify-between items-center p-4 pb-2 border-b border-zinc-100 dark:border-white/5">
                                                <div className="flex items-center gap-2">
                                                    {view === 'agenda' ? (
                                                        <>
                                                            <Clock size={12} className="text-gaia-yellow" strokeWidth={3} />
                                                            <span className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 tracking-wider">
                                                                {(match.hora || '00:00').slice(0, 5)}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isGaiaWin ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : gaiaLost ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                                                            {isGaiaWin ? 'VITÓRIA' : gaiaLost ? 'DERROTA' : 'FIN'}
                                                        </span>
                                                    )}
                                                </div>
                                                {match.status === 'A DECORRER' && (
                                                    <span className="text-red-500 text-[10px] font-bold flex items-center gap-1 animate-pulse">
                                                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                                        LIVE
                                                    </span>
                                                )}
                                                <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                                                    {match.escalao}
                                                </span>
                                            </div>
                                            <div className="p-4 flex flex-col gap-3">
                                                <div className={`flex items-center justify-between ${match.resultado_casa !== null && match.resultado_fora !== null && match.resultado_casa < match.resultado_fora ? 'opacity-60' : ''}`}>
                                                    <div className="flex items-center gap-3">
                                                        {match.logotipo_casa ? (
                                                            <img src={match.logotipo_casa} alt="" className="w-8 h-8 object-contain" />
                                                        ) : (
                                                            <div className="w-8 h-8 bg-zinc-100 dark:bg-white/10 rounded-full flex items-center justify-center">
                                                                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">{match.equipa_casa.substring(0, 1)}</span>
                                                            </div>
                                                        )}
                                                        <span className="text-sm font-bold text-zinc-900 dark:text-white leading-tight truncate max-w-[120px]">
                                                            {match.equipa_casa.toUpperCase()}
                                                        </span>
                                                    </div>
                                                    {view === 'results' && match.resultado_casa !== null && (
                                                        <span className={`text-xl font-mono font-bold ${match.resultado_casa > (match.resultado_fora || 0) ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>
                                                            {match.resultado_casa}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className={`flex items-center justify-between ${match.resultado_casa !== null && match.resultado_fora !== null && match.resultado_fora < match.resultado_casa ? 'opacity-60' : ''}`}>
                                                    <div className="flex items-center gap-3">
                                                        {match.logotipo_fora ? (
                                                            <img src={match.logotipo_fora} alt="" className="w-8 h-8 object-contain" />
                                                        ) : (
                                                            <div className="w-8 h-8 bg-zinc-100 dark:bg-white/10 rounded-full flex items-center justify-center">
                                                                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">{match.equipa_fora.substring(0, 1)}</span>
                                                            </div>
                                                        )}
                                                        <span className="text-sm font-bold text-zinc-900 dark:text-white leading-tight truncate max-w-[120px]">
                                                            {match.equipa_fora.toUpperCase()}
                                                        </span>
                                                    </div>
                                                    {view === 'results' && match.resultado_fora !== null && (
                                                        <span className={`text-xl font-mono font-bold ${match.resultado_fora > (match.resultado_casa || 0) ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>
                                                            {match.resultado_fora}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="px-4 pb-4 pt-0 flex justify-between items-center text-[10px] font-medium text-zinc-600 dark:text-zinc-500 uppercase tracking-wide">
                                                <div className="flex items-center gap-1.5 truncate max-w-[70%]">
                                                    {match.local ? (
                                                        <>
                                                            <MapPin size={10} className="shrink-0 text-gaia-yellow" />
                                                            <span className="truncate text-zinc-500">{match.local}</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-zinc-500">{match.competicao}</span>
                                                    )}
                                                </div>
                                                <ChevronRight size={14} className="text-zinc-500 group-hover:text-gaia-yellow transition-colors" />
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Games
