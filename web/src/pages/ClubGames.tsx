import { RefreshCw, AlertCircle } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import { useClub } from '../lib/ClubContext'
import { useGames } from '../hooks/useGames'
import { useTimeAgo } from '../hooks/useTimeAgo'
import { SkeletonGameGrid } from '../components/Skeleton'
import { GameCard } from '../components/GameCard'
import { SegmentControl } from '../components/SegmentControl'
import { Match } from '../components/types'

export default function ClubGames() {
    const [searchParams, setSearchParams] = useSearchParams()
    const { clubId, clubName } = useClub()

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

    const filtered = useMemo(() => matches.filter(m => {
        if (view === 'agenda' && m.status === 'FINALIZADO') return false
        if (view === 'results' && m.status !== 'FINALIZADO') return false
        if (filterEscalao !== 'Todos' && m.escalao !== filterEscalao) return false
        return true
    }), [matches, view, filterEscalao])

    const grouped = useMemo(() => {
        const groups: Record<string, Match[]> = {}
        for (const m of filtered) {
            const key = new Date(m.data).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })
            if (!groups[key]) groups[key] = []
            groups[key].push(m)
        }
        return Object.entries(groups).sort(([a], [b]) => view === 'agenda' ? a.localeCompare(b) : b.localeCompare(a))
    }, [filtered, view])

    if (loading && matches.length === 0) return <SkeletonGameGrid />
    if (error && matches.length === 0) return <div className="flex flex-col items-center justify-center py-20 text-zinc-500"><AlertCircle size={32} className="mb-2" /><p>{error}</p><button onClick={refresh} className="text-amber-500 text-sm font-bold mt-2">Tentar novamente</button></div>

    return (
        <div className="max-w-xl mx-auto pb-24 px-3">
            <div className="flex items-start justify-between mb-4 pt-2">
                <div>
                    <h1 className="text-xl font-black text-zinc-900 dark:text-white">Jogos</h1>
                    <p className="text-xs text-zinc-500 mt-0.5">{clubName} · 2025/2026</p>
                </div>
                <div className="flex items-center gap-2">
                    {lastUpdated && <span className="text-[10px] text-zinc-400">{timeAgo}</span>}
                    <button onClick={refresh} className="p-1.5 text-zinc-400 hover:text-amber-500 transition-colors"><RefreshCw size={16} /></button>
                </div>
            </div>

            <SegmentControl value={view} onChange={(v) => setView(v as 'agenda' | 'results')} options={[{ value: 'agenda', label: 'Agenda' }, { value: 'results', label: 'Resultados' }]} />

            {escaloes.length > 1 && (
                <div className="flex gap-1.5 flex-wrap my-3">
                    {['Todos', ...escaloes].map(e => (
                        <button key={e} onClick={() => setFilterEscalao(e)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold transition-colors ${filterEscalao === e ? 'bg-amber-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>
                            {e}
                        </button>
                    ))}
                </div>
            )}

            {filtered.length === 0 ? (
                <div className="text-center py-16 text-zinc-400 font-medium">Nenhum jogo encontrado.</div>
            ) : (
                <div className="space-y-6 mt-3">
                    {grouped.map(([date, games]) => (
                        <div key={date}>
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">{date}</h3>
                            <div className="space-y-2">
                                {games.map(g => <GameCard key={g.slug} match={g} mode={view === 'agenda' ? 'agenda' : 'results'} />)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
