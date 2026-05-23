import { useMemo } from 'react'
import { Link, useParams, useOutletContext } from 'react-router-dom'
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Clock, ChevronRight } from 'lucide-react'
import { useGames } from '../../hooks/useGames'
import { SkeletonGameGrid } from '../../components/Skeleton'
import { type Club } from '../../lib/ClubContext'

function ClubTeamDetail() {
    const { club } = useOutletContext<{ club: Club }>()
    const { escalao } = useParams<{ escalao: string }>()
    const decoded = decodeURIComponent(escalao || '')
    const { games: allGames, loading } = useGames('2025/2026', club.id)
    const games = allGames || []
    const clubNameUpper = club.name.toUpperCase()

    const teamGames = useMemo(() =>
        games.filter(g => g.escalao === decoded),
    [games, decoded])

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

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        const formatted = date.toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric', month: 'long' })
        return formatted.charAt(0).toUpperCase() + formatted.slice(1)
    }

    if (loading) {
        return (
            <div className="max-w-xl mx-auto px-3 pt-4">
                <SkeletonGameGrid days={2} count={3} />
            </div>
        )
    }

    return (
        <div className="max-w-xl mx-auto space-y-4 pb-20 px-3">
            <div className="flex items-center justify-between pt-3">
                <Link to={`/clube/${club.slug}/team`} className="p-2 -ml-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                    <ArrowLeft size={22} />
                </Link>
                <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-500">EQUIPA</span>
                <div className="w-10" />
            </div>

            {/* Header */}
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

                {/* Stats */}
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

                {/* Form */}
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

            {/* Upcoming Games */}
            {upcoming.length > 0 && (
                <div className="space-y-2 animate-slide-up">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white px-1">Próximos Jogos</h3>
                    <div className="space-y-2">
                        {upcoming.map(match => {
                            const slug = match.slug || ''
                            const opponent = match.equipa_casa.toUpperCase().includes(clubNameUpper) ? match.equipa_fora : match.equipa_casa
                            return (
                                <Link to={`/game/${slug}?clube=${club.slug}`} key={slug} className="flex items-center gap-3 p-3 glass-card hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                    <Clock size={12} className="text-dribly-blue shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-zinc-900 dark:text-white truncate">
                                            <span className="font-bold">{club.name.toUpperCase()}</span>
                                            <span className="text-zinc-400 mx-1">vs</span>
                                            <span>{opponent}</span>
                                        </p>
                                    </div>
                                    <span className="text-xs text-zinc-500">{formatDate(match.data)}</span>
                                    <ChevronRight size={12} className="text-zinc-400 group-hover:text-dribly-blue shrink-0" />
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Recent Results */}
            {finished.length > 0 && (
                <div className="space-y-2 animate-slide-up">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white px-1">Últimos Resultados</h3>
                    <div className="space-y-2">
                        {finished.slice(0, 10).map(match => {
                            const clubHome = match.equipa_casa.toUpperCase().includes(clubNameUpper)
                            const opponent = clubHome ? match.equipa_fora : match.equipa_casa
                            const clubScore = clubHome ? match.resultado_casa : match.resultado_fora
                            const oppScore = clubHome ? match.resultado_fora : match.resultado_casa
                            const won = clubScore !== null && oppScore !== null && clubScore > oppScore
                            const draw = clubScore !== null && oppScore !== null && clubScore === oppScore
                            const slug = match.slug || ''
                            return (
                                <Link to={`/game/${slug}?clube=${club.slug}`} key={slug} className="flex items-center gap-3 p-3 glass-card hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                    {clubScore !== null && oppScore !== null ? (
                                        draw ? <Minus size={14} className="text-blue-500 shrink-0" />
                                        : won ? <TrendingUp size={14} className="text-green-500 shrink-0" />
                                        : <TrendingDown size={14} className="text-red-500 shrink-0" />
                                    ) : (
                                        <Minus size={14} className="text-zinc-300 shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-zinc-900 dark:text-white truncate">
                                            <span className="font-bold">{club.name.toUpperCase()}</span>
                                            <span className="text-zinc-500 mx-1">{clubScore}-{oppScore}</span>
                                            <span className="text-zinc-400 dark:text-zinc-500">{opponent}</span>
                                        </p>
                                    </div>
                                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase shrink-0">{formatDate(match.data)}</span>
                                    <ChevronRight size={12} className="text-zinc-400 group-hover:text-dribly-blue shrink-0" />
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Team Roster Placeholder */}
            <div className="glass-card p-6 animate-slide-up text-center">
                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-3">
                    <UsersIcon size={24} className="text-zinc-400" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">Plantel</h3>
                <p className="text-xs text-zinc-500">A informação do plantel estará disponível em breve.</p>
            </div>
        </div>
    )
}

function UsersIcon({ size, className }: { size: number; className?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}

export default ClubTeamDetail
