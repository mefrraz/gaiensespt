import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Calendar, ChevronRight, Clock, MapPin } from 'lucide-react'
import { useClub } from '../lib/ClubContext'
import { useGames } from '../hooks/useGames'
import { SkeletonHero } from '../components/Skeleton'
import { Match } from '../components/types'
import { useEffect } from 'react'

export default function ClubHome() {
    const { clubId, clubName, clubSlug, loading: clubLoading } = useClub()
    const { games: allGames, loading } = useGames('2025/2026', clubId ?? undefined)
    const games = allGames || []
    const navigate = useNavigate()

    useEffect(() => {
        if (!clubLoading && !clubId) navigate('/', { replace: true })
    }, [clubLoading, clubId])

    const nextGame = useMemo(() => {
        if (games.length === 0) return null
        const upcoming = games.filter(g => g.status !== 'FINALIZADO').sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
        return upcoming.length > 0 ? upcoming[0] : null
    }, [games])

    const upcomingGames = useMemo(() => {
        if (!nextGame) return []
        return games.filter(g => g.status !== 'FINALIZADO').sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()).slice(1, 4)
    }, [games, nextGame])

    const recentResults = useMemo(() => {
        return games.filter(g => g.status === 'FINALIZADO').sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).slice(0, 3)
    }, [games])

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        const formatted = date.toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric', month: 'long' })
        return formatted.charAt(0).toUpperCase() + formatted.slice(1)
    }

    const isClubWin = (match: Match) => {
        if (match.resultado_casa === null || match.resultado_fora === null) return null
        const cName = clubName?.toUpperCase() || ''
        const cHome = match.equipa_casa.toUpperCase().includes(cName)
        return cHome ? match.resultado_casa > match.resultado_fora : match.resultado_fora > match.resultado_casa
    }

    const seasonRecord = useMemo(() => {
        const finished = games.filter(g => g.status === 'FINALIZADO')
        let wins = 0, losses = 0
        finished.forEach(g => {
            const result = isClubWin(g)
            if (result === true) wins++
            else if (result === false) losses++
        })
        return { wins, losses, total: finished.length }
    }, [games, clubName])

    if (clubLoading || loading) return <div className="max-w-xl mx-auto px-3 pt-4"><SkeletonHero /></div>

    return (
        <div className="max-w-2xl mx-auto pb-24 px-3">
            <div className="flex items-center gap-3 mb-5 pt-2 animate-fade-in">
                <div className="w-9 h-9 rounded-full bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center font-bold text-violet-600 text-sm">{clubName.charAt(0)}</div>
                <div>
                    <h1 className="text-lg font-black">{clubName}</h1>
                    <p className="text-[10px] font-medium text-[#6B6880] dark:text-[#9B99B5] uppercase tracking-wider">Época 2025/2026</p>
                </div>
            </div>

            {/* Season Record */}
            {seasonRecord.total > 0 && (
                <div className="flex gap-2 mb-5">
                    <div className="flex-1 bg-white dark:bg-[#16161F] border border-[#E4E2F5] dark:border-[#2A2A3D] rounded-2xl p-3 text-center">
                        <p className="text-[10px] font-bold text-[#6B6880] dark:text-[#9B99B5] uppercase tracking-wider">Vitórias</p>
                        <p className="text-lg font-black text-[#22C55E]">{seasonRecord.wins}</p>
                    </div>
                    <div className="flex-1 bg-white dark:bg-[#16161F] border border-[#E4E2F5] dark:border-[#2A2A3D] rounded-2xl p-3 text-center">
                        <p className="text-[10px] font-bold text-[#6B6880] dark:text-[#9B99B5] uppercase tracking-wider">Derrotas</p>
                        <p className="text-lg font-black text-[#EF4444]">{seasonRecord.losses}</p>
                    </div>
                    <div className="flex-1 bg-white dark:bg-[#16161F] border border-[#E4E2F5] dark:border-[#2A2A3D] rounded-2xl p-3 text-center">
                        <p className="text-[10px] font-bold text-[#6B6880] dark:text-[#9B99B5] uppercase tracking-wider">Jogos</p>
                        <p className="text-lg font-black">{seasonRecord.total}</p>
                    </div>
                </div>
            )}

            {/* Next Game */}
            {nextGame && (
                <Link to={`/clube/${clubSlug}/jogo/${nextGame.slug}`} className="block bg-white dark:bg-[#16161F] border border-[#E4E2F5] dark:border-[#2A2A3D] rounded-2xl p-4 mb-5 shadow-sm hover:border-violet-600/30 transition-all group">
                    <div className="flex items-center gap-2 mb-3">
                        <Calendar size={14} className="text-violet-600" />
                        <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wider">Próximo Jogo</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-sm font-bold truncate flex-1">{nextGame.equipa_casa}</span>
                        <span className="text-xs font-black text-[#9B99B5] px-2">VS</span>
                        <span className="text-sm font-bold truncate flex-1 text-right">{nextGame.equipa_fora}</span>
                    </div>
                    <p className="text-xs text-[#6B6880] dark:text-[#9B99B5]">{formatDate(nextGame.data)}{nextGame.hora && ` · ${nextGame.hora.slice(0, 5)}`}</p>
                    {nextGame.local && <div className="flex items-center gap-1.5 mt-1.5"><MapPin size={11} className="text-[#9B99B5]" /><p className="text-[10px] text-[#9B99B5]">{nextGame.local}</p></div>}
                </Link>
            )}

            {/* Upcoming games */}
            {upcomingGames.length > 0 && (
                <div className="mb-5">
                    <p className="text-[10px] font-bold text-[#6B6880] dark:text-[#9B99B5] uppercase tracking-wider mb-2">Próximos Jogos</p>
                    <div className="space-y-1.5">
                        {upcomingGames.map(g => (
                            <Link to={`/clube/${clubSlug}/jogo/${g.slug}`} key={g.slug} className="flex items-center gap-2 p-2.5 bg-white dark:bg-[#16161F] border border-[#E4E2F5] dark:border-[#2A2A3D] rounded-xl hover:border-violet-600/30 transition-all">
                                <Clock size={12} className="text-[#9B99B5] shrink-0" />
                                <span className="text-xs font-bold truncate flex-1">{g.equipa_casa} vs {g.equipa_fora}</span>
                                <span className="text-[10px] text-[#9B99B5] shrink-0">{formatDate(g.data).split(' ').slice(1).join(' ')}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent results */}
            {recentResults.length > 0 && (
                <div className="mb-5">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold text-[#6B6880] dark:text-[#9B99B5] uppercase tracking-wider">Últimos Resultados</p>
                        <Link to={`/clube/${clubSlug}/jogos?view=results`} className="text-[10px] font-bold text-violet-600 flex items-center gap-0.5">Ver todos <ChevronRight size={10} /></Link>
                    </div>
                    <div className="space-y-1.5">
                        {recentResults.map(g => {
                            const won = isClubWin(g)
                            const cName = clubName?.toUpperCase() || ''
                            const isHome = g.equipa_casa.toUpperCase().includes(cName)
                            return (
                                <Link to={`/clube/${clubSlug}/jogo/${g.slug}`} key={g.slug}
                                    className={`flex items-center gap-2 p-2.5 bg-white dark:bg-[#16161F] border rounded-xl transition-all ${
                                        won === true ? 'border-[#22C55E]/30' : won === false ? 'border-[#EF4444]/30' : 'border-[#E4E2F5] dark:border-[#2A2A3D]'
                                    }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${won === true ? 'bg-[#22C55E]' : won === false ? 'bg-[#EF4444]' : 'bg-[#9B99B5]'}`} />
                                    <span className="text-xs font-bold truncate flex-1">
                                        {isHome ? g.equipa_casa : g.equipa_fora}
                                        <span className="text-[#9B99B5] mx-1">{g.resultado_casa}-{g.resultado_fora}</span>
                                        {isHome ? g.equipa_fora : g.equipa_casa}
                                    </span>
                                    <span className="text-[10px] text-[#9B99B5] shrink-0">{new Date(g.data).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })}</span>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}

            <Link to={`/clube/${clubSlug}/jogos`}
                className="flex items-center justify-center gap-2 w-full py-3 bg-violet-600 text-white text-sm font-bold rounded-2xl hover:bg-violet-500 transition-colors shadow-md shadow-violet-600/20">
                <Calendar size={16} /> Ver Todos os Jogos
            </Link>
            <style>{`.animate-fade-in{animation:fadeIn .4s ease-out}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
        </div>
    )
}
