import { useState, useEffect } from 'react'
import { Filter, Trophy } from 'lucide-react'
import { useGames } from '../hooks/useGames'
import { SkeletonBar } from '../components/Skeleton'
import { EmptyState } from '../components/EmptyState'
import { GameCard } from '../components/GameCard'
import { Match } from '../components/types'

function Results() {
    const [filterEscalao, setFilterEscalao] = useState<string>('Todos')
    const [escaloes, setEscaloes] = useState<string[]>([])

    const { games: allGames, loading, error } = useGames('2025/2026', 119)
    const matches = (allGames || []).filter(m => m.status === 'FINALIZADO')

    useEffect(() => {
        const uniqueEscaloes = Array.from(new Set(matches.map(m => m.escalao))).filter(Boolean).sort()
        setEscaloes(uniqueEscaloes)
    }, [matches])

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
    Object.values(groupedMatches).forEach(g => g.sort((a, b) => (a.hora || '99:99').localeCompare(b.hora || '99:99')))

    const sortedDates = Object.keys(groupedMatches).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    const formatDate = (dateStr: string) => {
        const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'long' }
        const date = new Date(dateStr).toLocaleDateString('pt-PT', options)
        return date.charAt(0).toUpperCase() + date.slice(1)
    }

    return (
        <div className="max-w-6xl mx-auto space-y-4 pb-24">
            <div className="px-3 pt-4 animate-fade-in">
                <h1 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Trophy size={18} className="text-gaia-yellow" />
                    Resultados
                </h1>
            </div>

            <div className="px-3 max-w-md mx-auto">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                        <Filter size={14} />
                    </div>
                    <select value={filterEscalao} onChange={(e) => setFilterEscalao(e.target.value)} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-zinc-800 dark:text-zinc-200 text-xs font-medium rounded-lg focus:ring-2 focus:ring-gaia-yellow/30 focus:border-gaia-yellow block w-full pl-9 p-2.5 appearance-none shadow-sm transition-colors">
                        <option value="Todos">Todos os Escalões</option>
                        {escaloes.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                </div>
            </div>

            {loading && <SkeletonBar />}

            {!loading && error && matches.length === 0 && (
                <EmptyState icon="error" title="Erro" subtitle={error} />
            )}

            {!loading && !error && sortedDates.length === 0 && (
                <EmptyState view="results" />
            )}

            {!loading && sortedDates.length > 0 && (
                <div className="space-y-6 px-2 md:px-4">
                    {sortedDates.map(date => (
                        <div key={date} className="animate-slide-up">
                            <div className="flex items-center gap-3 mb-3 px-2">
                                <h3 className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">{formatDate(date)}</h3>
                                <div className="flex-1 h-px bg-zinc-200 dark:bg-white/5" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {groupedMatches[date].map(match => (
                                    <GameCard key={match.id || match.slug} match={match} mode="results" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Results
