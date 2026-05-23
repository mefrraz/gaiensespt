import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { RefreshCw, AlertCircle } from 'lucide-react'
import { useClub } from '../lib/ClubContext'
import { useGames } from '../hooks/useGames'
import { useTimeAgo } from '../hooks/useTimeAgo'
import { SkeletonGameGrid } from '../components/Skeleton'
import { EmptyState } from '../components/EmptyState'
import { GameCard } from '../components/GameCard'
import { SegmentControl } from '../components/SegmentControl'
import { Match } from '../components/types'

export default function ClubGames() {
    const [searchParams, setSearchParams] = useSearchParams()
    const { clubId, clubName, clubSlug } = useClub()

    const [view, setView] = useState<'agenda' | 'results'>(() => {
        return searchParams.get('view') === 'results' ? 'results' : 'agenda'
    })

    const [filterEscalao, setFilterEscalao] = useState('Todos')
    const { games: allGames, loading, lastUpdated, error, refresh } = useGames('2025/2026', clubId ?? undefined)
    const matches = allGames || []
    const timeAgo = useTimeAgo(lastUpdated)

    useEffect(() => { setSearchParams({ view }) }, [view, setSearchParams])

    const escaloes = useMemo(() =>
        Array.from(new Set(matches.map(m => m.escalao))).filter(Boolean).sort()
    , [matches])

    const filteredMatches = useMemo(() => matches.filter(match => {
        if (view === 'agenda' && match.status === 'FINALIZADO') return false
        if (view === 'results' && match.status !== 'FINALIZADO') return false
        if (filterEscalao !== 'Todos' && match.escalao !== filterEscalao) return false
        return true
    }), [matches, view, filterEscalao])

    const groupedMatches = useMemo(() => {
        const groups: Record<string, Match[]> = {}
        for (const match of filteredMatches) {
            const date = new Date(match.data)
            const key = date.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })
            if (!groups[key]) groups[key] = []
            groups[key].push(match)
        }
        const entries = Object.entries(groups)
        entries.sort(([a], [b]) => view === 'agenda' ? a.localeCompare(b) : b.localeCompare(a))
        return entries
    }, [filteredMatches, view])

    if (loading && matches.length === 0) return <SkeletonGameGrid />
    if (error && matches.length === 0) return (
        <div className="max-w-2xl mx-auto px-3 pt-20 text-center">
            <AlertCircle size={32} className="mx-auto text-[#9B99B5] mb-2" />
            <p className="text-sm text-[#6B6880] mb-3">{error}</p>
            <button onClick={refresh} className="text-sm font-bold text-violet-600 hover:underline">Tentar novamente</button>
        </div>
    )

    return (
        <div className="max-w-2xl mx-auto pb-24 px-3">
            <div className="flex items-start justify-between mb-4 pt-2">
                <div>
                    <h1 className="text-xl font-black">Jogos</h1>
                    <p className="text-xs text-[#6B6880] dark:text-[#9B99B5] mt-0.5">{clubName} · 2025/2026</p>
                </div>
                <div className="flex items-center gap-2 pt-1">
                    {lastUpdated && <span className="text-[10px] text-[#9B99B5]">{timeAgo}</span>}
                    <button onClick={refresh} className="p-1.5 text-[#9B99B5] hover:text-violet-600 transition-colors"><RefreshCw size={16} /></button>
                </div>
            </div>

            <div className="mb-3"><SegmentControl value={view} onChange={(v) => setView(v as 'agenda' | 'results')} options={[{ value: 'agenda', label: 'Agenda' }, { value: 'results', label: 'Resultados' }]} /></div>

            {escaloes.length > 1 && (
                <div className="flex gap-1.5 flex-wrap mt-3 mb-3">
                    {['Todos', ...escaloes].map(e => (
                        <button key={e} onClick={() => setFilterEscalao(e)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold transition-colors ${filterEscalao === e ? 'bg-violet-600 text-white' : 'bg-[#E4E2F5] dark:bg-[#2A2A3D] text-[#6B6880] dark:text-[#9B99B5]'}`}>{e}</button>
                    ))}
                </div>
            )}

            {filteredMatches.length === 0 ? (
                <EmptyState view={view} />
            ) : (
                <div className="space-y-6 mt-3">
                    {groupedMatches.map(([date, games]) => (
                        <div key={date}>
                            <h3 className="text-xs font-bold text-[#6B6880] dark:text-[#9B99B5] uppercase tracking-wider mb-2">{date}</h3>
                            <div className="space-y-2">
                                {games.map(match => (
                                    <GameCard key={match.slug} match={match} mode={view === 'agenda' ? 'agenda' : 'results'} clubSlug={clubSlug} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
