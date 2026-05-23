import { useMemo } from 'react'
import { Link, useParams, useOutletContext } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useGames } from '../../hooks/useGames'
import { SkeletonGameGrid } from '../../components/Skeleton'
import { GameCard } from '../../components/GameCard'
import { type Club, useClubColor } from '../../lib/ClubContext'
import { type Match } from '../../components/types'

function extractTeamId(fullTeamName: string, clubName: string, fallbackEscalao: string): string {
    const upperTeam = fullTeamName.toUpperCase()
    const upperClub = clubName.toUpperCase()
    let suffix = upperTeam
        .replace(new RegExp(upperClub.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '')
        .replace(/^[\s\-–—/]+/, '')
        .replace(/[\s\-–—/]+$/, '')
        .trim()
    if (!suffix || suffix.length < 2) suffix = fallbackEscalao || fullTeamName
    return suffix
}

function ClubTeamDetail() {
    const { club } = useOutletContext<{ club: Club }>()
    const clubColor = useClubColor()
    const { escalao } = useParams<{ escalao: string }>()
    const decoded = decodeURIComponent(escalao || '')
    const { games: allGames, loading } = useGames('2025/2026', club.id, club.name)
    const games = allGames || []
    const clubNameUpper = club.name.toUpperCase()

    const teamGames = useMemo(() =>
        games.filter(g => {
            let fullTeamName = ''
            if (g.equipa_casa.toUpperCase().includes(clubNameUpper)) fullTeamName = g.equipa_casa
            else if (g.equipa_fora.toUpperCase().includes(clubNameUpper)) fullTeamName = g.equipa_fora
            if (!fullTeamName) return false
            return extractTeamId(fullTeamName, club.name, g.escalao || '') === decoded
        }),
    [games, decoded, clubNameUpper, club.name])

    const finished = useMemo(() =>
        teamGames.filter(g => g.status === 'FINALIZADO').sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()),
    [teamGames])

    const upcoming = useMemo(() =>
        teamGames.filter(g => g.status !== 'FINALIZADO').sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()),
    [teamGames])

    const form = useMemo(() => {
        const results: ('W' | 'L' | 'D')[] = []
        finished.slice(0, 5).forEach(g => {
            if (g.resultado_casa === null || g.resultado_fora === null) return
            if (g.resultado_casa === g.resultado_fora) { results.push('D'); return }
            const clubHome = g.equipa_casa.toUpperCase().includes(clubNameUpper)
            if (clubHome) {
                results.push(g.resultado_casa > g.resultado_fora ? 'W' : 'L')
            } else {
                results.push(g.resultado_fora > g.resultado_casa ? 'W' : 'L')
            }
        })
        return results
    }, [finished, clubNameUpper])

    let wins = 0, losses = 0, draws = 0
    finished.forEach(g => {
        const clubHome = g.equipa_casa.toUpperCase().includes(clubNameUpper)
        if (g.resultado_casa === null || g.resultado_fora === null) return
        if (g.resultado_casa === g.resultado_fora) { draws++; return }
        if (clubHome ? g.resultado_casa > g.resultado_fora : g.resultado_fora > g.resultado_casa) wins++
        else losses++
    })
    const total = wins + losses + draws

    // Group games by date for the grid layout
    const upcomingByDate = useMemo(() => {
        const groups: Record<string, Match[]> = {}
        upcoming.forEach(g => {
            if (!groups[g.data]) groups[g.data] = []
            groups[g.data].push(g)
        })
        return Object.entries(groups).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    }, [upcoming])

    const finishedByDate = useMemo(() => {
        const groups: Record<string, Match[]> = {}
        finished.forEach(g => {
            if (!groups[g.data]) groups[g.data] = []
            groups[g.data].push(g)
        })
        return Object.entries(groups).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
    }, [finished])

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        const formatted = date.toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric', month: 'long' })
        return formatted.charAt(0).toUpperCase() + formatted.slice(1)
    }

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-3 pt-4">
                <SkeletonGameGrid days={2} count={3} />
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto pb-20 px-3 space-y-6">
            <div className="flex items-center justify-between pt-3">
                <Link to={`/clube/${club.slug}/team`} className="p-2 -ml-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                    <ArrowLeft size={22} />
                </Link>
                <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-500">EQUIPA</span>
                <div className="w-10" />
            </div>

            {/* Header Card */}
            <div className="glass-card p-5 animate-slide-up">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-dribly-blue/10 dark:bg-dribly-blue/20 flex items-center justify-center shrink-0">
                        <span className="text-xl font-black text-dribly-blue">{decoded.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-lg font-bold text-zinc-900 dark:text-white truncate">{decoded}</h1>
                        <p className="text-xs text-zinc-500">{club.name}</p>
                    </div>
                </div>

                {total > 0 && (
                    <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-zinc-100 dark:border-white/5">
                        <div className="text-center">
                            <span className="text-2xl font-bold text-zinc-900 dark:text-white">{total}</span>
                            <p className="text-[10px] text-zinc-500 uppercase">Jogos</p>
                        </div>
                        <div className="text-center">
                            <span className="text-2xl font-bold text-green-600 dark:text-green-400">{wins}</span>
                            <p className="text-[10px] text-zinc-500 uppercase">Vitórias</p>
                        </div>
                        <div className="text-center">
                            <span className="text-2xl font-bold text-red-500">{losses}</span>
                            <p className="text-[10px] text-zinc-500 uppercase">Derrotas</p>
                        </div>
                    </div>
                )}

                {form.length > 0 && (
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-zinc-100 dark:border-white/5">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">Forma:</span>
                        <div className="flex gap-1">
                            {form.map((r, i) => (
                                <span key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                    r === 'W' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                                    r === 'L' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                                    'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                }`}>{r}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Upcoming Games — GameCard grid */}
            {upcomingByDate.length > 0 && (
                <div className="space-y-4 animate-slide-up">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Próximos Jogos</h3>
                    {upcomingByDate.map(([date, dayGames]) => (
                        <div key={date}>
                            <div className="flex items-center gap-3 mb-3">
                                <h4 className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">{formatDate(date)}</h4>
                                <div className="flex-1 h-px bg-zinc-200 dark:bg-white/5" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {dayGames.map(match => (
                                    <GameCard
                                        key={match.id || match.slug}
                                        match={match}
                                        mode="agenda"
                                        clubName={club.name}
                                        clubSlug={club.slug}
                                        clubColor={clubColor}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Finished Games — GameCard grid */}
            {finishedByDate.length > 0 && (
                <div className="space-y-4 animate-slide-up">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Últimos Resultados</h3>
                    {finishedByDate.map(([date, dayGames]) => (
                        <div key={date}>
                            <div className="flex items-center gap-3 mb-3">
                                <h4 className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">{formatDate(date)}</h4>
                                <div className="flex-1 h-px bg-zinc-200 dark:bg-white/5" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {dayGames.map(match => (
                                    <GameCard
                                        key={match.id || match.slug}
                                        match={match}
                                        mode="results"
                                        clubName={club.name}
                                        clubSlug={club.slug}
                                        clubColor={clubColor}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ClubTeamDetail
