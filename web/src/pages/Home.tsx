import { useState, useEffect } from 'react'
import { Filter, Loader2, MapPin, ChevronRight, Clock, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useGames } from '../hooks/useGames'
import { Match } from '../components/types'

function Home() {
    const [filterEscalao, setFilterEscalao] = useState<string>('Todos')
    const [escaloes, setEscaloes] = useState<string[]>([])
    const [timeAgo, setTimeAgo] = useState<string>('')

    const { games: allGames, loading, lastUpdated } = useGames('2025/2026', 119)

    const matches = (allGames || []).filter(m => m.status !== 'FINALIZADO')

    useEffect(() => {
        const uniqueEscaloes = Array.from(new Set(matches.map(m => m.escalao))).filter(Boolean).sort()
        setEscaloes(uniqueEscaloes)
    }, [matches])

    useEffect(() => {
        const updateTimeAgo = () => {
            if (!lastUpdated) {
                setTimeAgo('')
                return
            }
            const diffMs = Date.now() - lastUpdated.getTime()
            const diffMins = Math.floor(diffMs / 60000)
            if (diffMins < 1) setTimeAgo('agora mesmo')
            else if (diffMins < 60) setTimeAgo(`há ${diffMins}min`)
            else {
                const hours = Math.floor(diffMins / 60)
                setTimeAgo(`há ${hours}h`)
            }
        }
        updateTimeAgo()
        const interval = setInterval(updateTimeAgo, 30000)
        return () => clearInterval(interval)
    }, [lastUpdated])

    const filteredMatches = matches.filter(match => {
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
        return new Date(a).getTime() - new Date(b).getTime()
    })

    const formatDate = (dateStr: string) => {
        const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'long' }
        const date = new Date(dateStr).toLocaleDateString('pt-PT', options)
        return date.charAt(0).toUpperCase() + date.slice(1)
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-24">
            <div className="flex items-center justify-between px-2 pt-2">
                <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Agenda</h1>
            </div>

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

            <div className="px-2 max-w-md mx-auto">
                <Link to="/about" className="flex items-center justify-between text-[10px] text-zinc-400 uppercase tracking-wide hover:text-gaia-yellow transition-colors group">
                    <div className="flex items-center gap-1.5">
                        <RefreshCw size={10} className="group-hover:animate-spin" />
                        <span>Atualizado: {timeAgo || '--'}</span>
                    </div>
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center py-32">
                    <Loader2 className="animate-spin text-gaia-yellow" size={32} />
                </div>
            ) : (
                <div className="space-y-8 px-1">
                    {sortedDates.length === 0 ? (
                        <div className="text-center py-20 text-zinc-600 font-medium">
                            Nenhum jogo agendado.
                        </div>
                    ) : (
                        sortedDates.map(date => (
                            <div key={date} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-500 mb-3 uppercase tracking-widest pl-2">
                                    {formatDate(date)}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {groupedMatches[date].map(match => {
                                        const matchSlug = match.slug || `${match.data}-${match.equipa_casa.toLowerCase().replace(/\s+/g, '-')}-${match.equipa_fora.toLowerCase().replace(/\s+/g, '-')}`
                                        return (
                                            <Link to={`/game/${matchSlug}`} key={matchSlug} className="glass-card flex flex-col gap-0 group active:scale-[0.98] hover:border-gaia-yellow/30">
                                                <div className="flex justify-between items-center p-4 pb-2 border-b border-zinc-100 dark:border-white/5">
                                                    <div className="flex items-center gap-2 text-gaia-yellow">
                                                        <Clock size={12} strokeWidth={3} />
                                                        <span className="text-xs font-mono font-bold tracking-wider">
                                                            {(match.hora || '00:00').slice(0, 5)}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                                                        {match.escalao}
                                                    </span>
                                                </div>
                                                <div className="p-4 flex flex-col gap-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            {match.logotipo_casa ? (
                                                                <img src={match.logotipo_casa} alt={match.equipa_casa} className="w-8 h-8 object-contain" />
                                                            ) : (
                                                                <div className="w-8 h-8 bg-zinc-100 dark:bg-white/10 rounded-full flex items-center justify-center">
                                                                    <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">{match.equipa_casa.substring(0, 1)}</span>
                                                                </div>
                                                            )}
                                                            <span className="text-sm font-bold text-zinc-900 dark:text-white leading-tight truncate max-w-[150px]">
                                                                {match.equipa_casa.toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            {match.logotipo_fora ? (
                                                                <img src={match.logotipo_fora} alt={match.equipa_fora} className="w-8 h-8 object-contain" />
                                                            ) : (
                                                                <div className="w-8 h-8 bg-zinc-100 dark:bg-white/10 rounded-full flex items-center justify-center">
                                                                    <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">{match.equipa_fora.substring(0, 1)}</span>
                                                                </div>
                                                            )}
                                                            <span className="text-sm font-bold text-zinc-900 dark:text-white leading-tight truncate max-w-[150px]">
                                                                {match.equipa_fora.toUpperCase()}
                                                            </span>
                                                        </div>
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

export default Home
