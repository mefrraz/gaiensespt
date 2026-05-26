import { useMemo, useState, useEffect } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { Calendar, Trophy, ChevronRight, Clock, MapPin, RefreshCw, AlertCircle } from 'lucide-react'
import { useGames } from '../../hooks/useGames'
import { SkeletonHero } from '../../components/Skeleton'
import { Match } from '../../components/types'
import { type Club } from '../../lib/ClubContext'

function ClubHome() {
    const { club } = useOutletContext<{ club: Club }>()
    const { games: allGames, loading, error, refresh } = useGames('2025/2026', club.id, club.name)
    const [showLoadingMsg, setShowLoadingMsg] = useState(false)
    const games = allGames || []

    useEffect(() => {
        setShowLoadingMsg(false)
        if (!loading) return
        const t = setTimeout(() => setShowLoadingMsg(true), 1000)
        return () => clearTimeout(t)
    }, [loading])

    const clubNameUpper = club.name.toUpperCase()

    const nextGame = useMemo(() => {
        if (games.length === 0) return null
        const upcoming = games
            .filter(g => g.status !== 'FINALIZADO')
            .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
        return upcoming.length > 0 ? upcoming[0] : null
    }, [games])

    const upcomingGames = useMemo(() => {
        if (games.length === 0 || !nextGame) return []
        return games
            .filter(g => g.status !== 'FINALIZADO')
            .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
            .slice(1, 4)
    }, [games, nextGame])

    const recentResults = useMemo(() => {
        if (games.length === 0) return []
        return games
            .filter(g => g.status === 'FINALIZADO')
            .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
            .slice(0, 3)
    }, [games])

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        const formatted = date.toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric', month: 'long' })
        return formatted.charAt(0).toUpperCase() + formatted.slice(1)
    }

    const isClubWin = (match: Match) => {
        if (match.resultado_casa === null || match.resultado_fora === null) return null
        const homeUpper = match.equipa_casa.toUpperCase()
        const awayUpper = match.equipa_fora.toUpperCase()
        const isHome = homeUpper.includes(clubNameUpper) || clubNameUpper.includes(homeUpper)
        if (isHome) return match.resultado_casa > match.resultado_fora
        const isAway = awayUpper.includes(clubNameUpper) || clubNameUpper.includes(awayUpper)
        if (isAway) return match.resultado_fora > match.resultado_casa
        return null
    }

    const seasonRecord = useMemo(() => {
        const finished = games.filter(g => g.status === 'FINALIZADO')
        let wins = 0, losses = 0
        finished.forEach(g => {
            const homeUpper = g.equipa_casa.toUpperCase()
            const awayUpper = g.equipa_fora.toUpperCase()
            const isHome = homeUpper.includes(clubNameUpper) || clubNameUpper.includes(homeUpper)
            const isAway = awayUpper.includes(clubNameUpper) || clubNameUpper.includes(awayUpper)
            const clubWon = isHome
                ? g.resultado_casa! > g.resultado_fora!
                : isAway
                    ? g.resultado_fora! > g.resultado_casa!
                    : false
            if (g.resultado_casa !== null && g.resultado_fora !== null) {
                if (clubWon) wins++
                else losses++
            }
        })
        const total = wins + losses
        const pct = total > 0 ? Math.round(wins / total * 100) : null
        return { wins, losses, total, pct }
    }, [games, clubNameUpper])

    if (loading) {
        return (
            <div className="max-w-xl mx-auto space-y-5 pb-20 px-3">
                {showLoadingMsg && (
                    <div className="text-center text-xs text-zinc-500 dark:text-zinc-400 animate-fade-in flex items-center justify-center gap-2 pt-2">
                        <RefreshCw size={12} className="animate-spin" />
                        A atualizar dados...
                    </div>
                )}
                <SkeletonHero />
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-zinc-100 dark:bg-zinc-900 animate-pulse h-32" />
                    <div className="rounded-2xl bg-[var(--club-color)]/30 animate-pulse h-32" />
                </div>
            </div>
        )
    }

    if (error && games.length === 0) {
        return (
            <div className="max-w-xl mx-auto space-y-5 pb-20 px-3">
                <div className="glass-card p-6 text-center">
                    <AlertCircle size={32} className="mx-auto text-amber-500 mb-3" />
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-4">{error}</p>
                    <button
                        onClick={() => refresh()}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--club-color)] text-white text-sm font-bold hover:opacity-90 transition-opacity"
                    >
                        <RefreshCw size={14} />
                        Tentar novamente
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-xl mx-auto space-y-5 pb-20 px-3">
            {games.length === 0 && !loading && !error && (
                <div className="glass-card p-6 text-center animate-fade-in">
                    <Calendar size={32} className="mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Este clube não tem jogos registados na FPB para esta época.</p>
                </div>
            )}
            {/* Hero: Next Game */}
            {nextGame && (
                <Link to={`/game/${nextGame.slug || ''}?clube=${club.slug}`} className="block group animate-slide-up">
                    <div className="glass-card overflow-hidden group-hover:border-[var(--club-color)]/30 transition-all duration-200">
                        <div className="bg-gradient-to-r from-[var(--club-color)]/10 via-zinc-50 to-[var(--club-color)]/10 dark:from-[var(--club-color)]/5 dark:via-zinc-900 dark:to-[var(--club-color)]/5 border-b border-zinc-100 dark:border-white/5 p-3 flex justify-between items-center">
                            <span className="text-[10px] font-bold text-[var(--club-color)] uppercase tracking-wide">{nextGame.escalao || 'Sénior Masculino'}</span>
                            <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 uppercase truncate ml-2">{nextGame.competicao || ''}</span>
                        </div>
                        <div className="px-6 py-8">
                            <div className="flex items-center justify-between gap-4">
                                <TeamBlock name={nextGame.equipa_casa} logo={nextGame.logotipo_casa} />
                                <div className="flex flex-col items-center gap-1 shrink-0">
                                    <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                        <span className="text-sm font-black text-zinc-400 dark:text-zinc-500">VS</span>
                                    </div>
                                </div>
                                <TeamBlock name={nextGame.equipa_fora} logo={nextGame.logotipo_fora} />
                            </div>
                            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                                <div className="h-px w-8 bg-zinc-200 dark:bg-white/10" />
                                <span className="capitalize font-medium">{formatDate(nextGame.data)} · {(nextGame.hora || '00:00').slice(0, 5)}</span>
                                <div className="h-px w-8 bg-zinc-200 dark:bg-white/10" />
                            </div>
                            {nextGame.local && (
                                <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-zinc-500 dark:text-zinc-400">
                                    <MapPin size={10} className="text-[var(--club-color)]" />
                                    <span className="truncate max-w-[220px]">{nextGame.local}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </Link>
            )}

            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-3">
                <Link to={`/clube/${club.slug}/games?view=agenda`} className="relative overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-900 p-5 h-32 group shadow-sm transition-all active:scale-[0.98] hover:border-[var(--club-color)]/20">
                    <Calendar size={56} className="absolute top-0 right-0 text-zinc-200 dark:text-zinc-800 transform rotate-12 translate-x-4 -translate-y-2 group-hover:scale-110 transition-transform" />
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                            <Calendar size={20} />
                        </div>
                        <h3 className="text-zinc-900 dark:text-white font-bold text-lg leading-tight">Jogos<br />& Agenda</h3>
                    </div>
                </Link>
                <Link to={`/clube/${club.slug}/team`} className="relative overflow-hidden rounded-2xl bg-[var(--club-color)] border border-[var(--club-color)] p-5 h-32 group shadow-sm shadow-[var(--club-color)]/10 transition-all active:scale-[0.98] hover:shadow-md">
                    <Trophy size={56} className="absolute top-0 right-0 text-white/20 transform -rotate-12 translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform" />
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                            <Trophy size={20} />
                        </div>
                        <h3 className="text-white font-bold text-lg leading-tight">Equipas<br />& Escalões</h3>
                    </div>
                </Link>
            </div>

            {/* Recent Results */}
            {recentResults.length > 0 && (
                <div className="space-y-3 animate-slide-up">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Últimos Resultados</h3>
                        <Link to={`/clube/${club.slug}/games?view=results`} className="text-xs text-[var(--club-color)] font-bold hover:underline">Ver todos</Link>
                    </div>
                    <div className="space-y-2">
                        {recentResults.map(match => {
                            const won = isClubWin(match)
                            const slug = match.slug || ''
                            return (
                                <Link to={`/game/${slug}?clube=${club.slug}`} key={slug} className="flex items-center gap-3 p-3 glass-card hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${won === true ? 'bg-dribly-green' : won === false ? 'bg-dribly-red' : 'bg-zinc-300'}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-zinc-900 dark:text-white truncate">
                                            <span className={won === true ? 'font-bold' : ''}>{match.equipa_casa}</span>
                                            <span className="text-zinc-400 mx-1">vs</span>
                                            <span className={won === false ? 'font-bold' : ''}>{match.equipa_fora}</span>
                                        </p>
                                    </div>
                                    <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 tabular-nums">
                                        {match.resultado_casa}-{match.resultado_fora}
                                    </span>
                                    <ChevronRight size={12} className="text-zinc-400 group-hover:text-[var(--club-color)] shrink-0" />
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Upcoming Games */}
            {upcomingGames.length > 0 && (
                <div className="space-y-3 animate-slide-up">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Próximos Jogos</h3>
                        <Link to={`/clube/${club.slug}/games?view=agenda`} className="text-xs text-[var(--club-color)] font-bold hover:underline">Ver agenda</Link>
                    </div>
                    <div className="space-y-2">
                        {upcomingGames.map(match => {
                            const slug = match.slug || ''
                            return (
                                <Link to={`/game/${slug}?clube=${club.slug}`} key={slug} className="flex items-center gap-3 p-3 glass-card hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                    <Clock size={12} className="text-[var(--club-color)] shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-zinc-900 dark:text-white truncate">
                                            <span>{match.equipa_casa}</span>
                                            <span className="text-zinc-400 mx-1">vs</span>
                                            <span>{match.equipa_fora}</span>
                                        </p>
                                    </div>
                                    <span className="text-xs text-zinc-500">{formatDate(match.data)}</span>
                                    <ChevronRight size={12} className="text-zinc-400 group-hover:text-[var(--club-color)] shrink-0" />
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Season Record */}
            {seasonRecord.total > 0 && (
                <div className="animate-slide-up">
                    <div className="flex items-center gap-2 mb-3">
                        <Trophy size={14} className="text-[var(--club-color)]" strokeWidth={2.5} />
                        <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Registo da Época 2025/26</h3>
                    </div>
                    <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-900/80 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
                        {/* Win % big number */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black tabular-nums" style={{ color: 'var(--club-color)' }}>
                                    {seasonRecord.pct}
                                </span>
                                <span className="text-lg font-bold text-zinc-400 dark:text-zinc-500">%</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                                <div className="text-center">
                                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 tabular-nums">{seasonRecord.wins}</span>
                                    <p className="text-[10px] font-bold text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-wider">V</p>
                                </div>
                                <div className="text-center">
                                    <span className="text-lg font-black text-red-500 dark:text-red-400 tabular-nums">{seasonRecord.losses}</span>
                                    <p className="text-[10px] font-bold text-red-500/70 dark:text-red-400/70 uppercase tracking-wider">D</p>
                                </div>
                                <div className="text-center">
                                    <span className="text-lg font-black text-zinc-500 dark:text-zinc-400 tabular-nums">{seasonRecord.total}</span>
                                    <p className="text-[10px] font-bold text-zinc-400/70 dark:text-zinc-500/70 uppercase tracking-wider">J</p>
                                </div>
                            </div>
                        </div>

                        {/* Visual win/loss bar */}
                        <div className="relative h-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                            <div
                                className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                                style={{
                                    width: `${seasonRecord.pct}%`,
                                    background: 'linear-gradient(90deg, var(--club-color), color-mix(in srgb, var(--club-color) 70%, #22c55e))',
                                }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[8px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mix-blend-multiply dark:mix-blend-screen">
                                    {seasonRecord.wins}V — {seasonRecord.losses}D
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function TeamBlock({ name, logo }: { name: string; logo: string | null }) {
    return (
        <div className="flex-1 flex flex-col items-center text-center gap-2 min-w-0">
            <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                {logo ? (
                    <img src={logo} alt="" className="w-14 h-14 object-contain" />
                ) : (
                    <span className="text-2xl font-bold text-zinc-500">{name.charAt(0)}</span>
                )}
            </div>
            <p className="text-sm font-bold text-zinc-900 dark:text-white leading-tight truncate w-full">
                {name.toUpperCase()}
            </p>
        </div>
    )
}

export default ClubHome