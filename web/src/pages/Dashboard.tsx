import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Trophy, ChevronRight, Clock, MapPin } from 'lucide-react'
import { useGames } from '../hooks/useGames'
import { SkeletonHero } from '../components/Skeleton'
import { Match } from '../components/types'

function Dashboard() {
    const [nextGame, setNextGame] = useState<Match | null>(null)
    const [upcomingGames, setUpcomingGames] = useState<Match[]>([])
    const [recentResults, setRecentResults] = useState<Match[]>([])

    const { games: allGames, loading } = useGames('2025/2026', 119)
    const games = allGames || []

    useEffect(() => {
        if (games.length === 0) return
        const upcoming = games
            .filter(g => g.status !== 'FINALIZADO')
            .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
        if (upcoming.length > 0) {
            setNextGame(upcoming[0])
            setUpcomingGames(upcoming.slice(1, 4))
        }
        const results = games
            .filter(g => g.status === 'FINALIZADO')
            .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
            .slice(0, 3)
        setRecentResults(results)
    }, [games])

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        const formatted = date.toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric', month: 'long' })
        return formatted.charAt(0).toUpperCase() + formatted.slice(1)
    }

    const isGaiaWin = (match: Match) => {
        if (match.resultado_casa === null || match.resultado_fora === null) return null
        const gaiaHome = match.equipa_casa.toUpperCase().includes('GAIA')
        return gaiaHome ? match.resultado_casa > match.resultado_fora : match.resultado_fora > match.resultado_casa
    }

    if (loading) {
        return (
            <div className="max-w-xl mx-auto space-y-5 pb-20 px-3">
                <SkeletonHero />
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-zinc-100 dark:bg-zinc-900 animate-pulse h-32" />
                    <div className="rounded-2xl bg-gaia-yellow/30 animate-pulse h-32" />
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-xl mx-auto space-y-5 pb-20 px-3">
            {/* Hero: Next Game */}
            {nextGame && (
                <Link to={`/game/${nextGame.slug || ''}`} className="block group animate-slide-up">
                    <div className="glass-card overflow-hidden group-hover:border-gaia-yellow/30 transition-all duration-200">
                        <div className="bg-gradient-to-r from-gaia-yellow/10 via-zinc-50 to-gaia-yellow/10 dark:from-gaia-yellow/5 dark:via-zinc-900 dark:to-gaia-yellow/5 border-b border-zinc-100 dark:border-white/5 p-3 flex justify-between items-center">
                            <span className="text-[10px] font-bold text-gaia-yellow uppercase tracking-wide">{nextGame.escalao || 'Sénior Masculino'}</span>
                            <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 uppercase truncate ml-2">{nextGame.competicao || ''}</span>
                        </div>
                        <div className="px-6 py-8">
                            <div className="flex items-center justify-between gap-4">
                                <TeamBlock name={nextGame.equipa_casa} logo={nextGame.logotipo_casa} />
                                <div className="flex flex-col items-center gap-1 shrink-0">
                                    <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center ring-2 ring-gaia-yellow/20">
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
                                    <MapPin size={10} className="text-gaia-yellow" />
                                    <span className="truncate max-w-[220px]">{nextGame.local}</span>
                                </div>
                            )}
                            <div className="mt-4 flex items-center justify-center gap-1 text-xs text-gaia-yellow font-bold group-hover:gap-2 transition-all">
                                <span>Ver detalhes</span>
                                <ChevronRight size={14} />
                            </div>
                        </div>
                    </div>
                </Link>
            )}

            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-3">
                <Link to="/games?view=agenda" className="relative overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-900 p-5 h-32 group shadow-sm transition-all active:scale-[0.98] hover:border-gaia-yellow/20">
                    <Calendar size={56} className="absolute top-0 right-0 text-zinc-200 dark:text-zinc-800 transform rotate-12 translate-x-4 -translate-y-2 group-hover:scale-110 transition-transform" />
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                            <Calendar size={20} />
                        </div>
                        <h3 className="text-zinc-900 dark:text-white font-bold text-lg leading-tight">Jogos<br />& Agenda</h3>
                    </div>
                </Link>
                <Link to="/standings" className="relative overflow-hidden rounded-2xl bg-gaia-yellow border border-gaia-yellow p-5 h-32 group shadow-sm shadow-yellow-500/10 transition-all active:scale-[0.98] hover:shadow-md">
                    <Trophy size={56} className="absolute top-0 right-0 text-black/20 transform -rotate-12 translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform" />
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center text-black">
                            <Trophy size={20} />
                        </div>
                        <h3 className="text-black font-bold text-lg leading-tight">Tabelas<br />& Pontos</h3>
                    </div>
                </Link>
            </div>

            {/* Recent Results */}
            {recentResults.length > 0 && (
                <div className="space-y-3 animate-slide-up">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Últimos Resultados</h3>
                        <Link to="/games?view=results" className="text-xs text-gaia-yellow font-bold hover:underline">Ver todos</Link>
                    </div>
                    <div className="space-y-2">
                        {recentResults.map(match => {
                            const won = isGaiaWin(match)
                            const slug = match.slug || ''
                            return (
                                <Link to={`/game/${slug}`} key={slug} className="flex items-center gap-3 p-3 glass-card hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${won === true ? 'bg-gaia-green' : won === false ? 'bg-gaia-red' : 'bg-zinc-300'}`} />
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
                                    <ChevronRight size={12} className="text-zinc-400 group-hover:text-gaia-yellow shrink-0" />
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
                        <Link to="/games?view=agenda" className="text-xs text-gaia-yellow font-bold hover:underline">Ver agenda</Link>
                    </div>
                    <div className="space-y-2">
                        {upcomingGames.map(match => {
                            const slug = match.slug || ''
                            return (
                                <Link to={`/game/${slug}`} key={slug} className="flex items-center gap-3 p-3 glass-card hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                    <Clock size={12} className="text-gaia-yellow shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-zinc-900 dark:text-white truncate">
                                            <span>{match.equipa_casa}</span>
                                            <span className="text-zinc-400 mx-1">vs</span>
                                            <span>{match.equipa_fora}</span>
                                        </p>
                                    </div>
                                    <span className="text-xs text-zinc-500">{formatDate(match.data)}</span>
                                    <ChevronRight size={12} className="text-zinc-400 group-hover:text-gaia-yellow shrink-0" />
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

function TeamBlock({ name, logo }: { name: string; logo: string | null }) {
    return (
        <div className="flex-1 flex flex-col items-center text-center gap-2 min-w-0">
            <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden ring-2 ring-gaia-yellow/30 shrink-0">
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

export default Dashboard
