import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Calendar, TrendingUp, TrendingDown, Minus, BarChart2, Users, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useClub } from '../lib/ClubContext'
import { useGames } from '../hooks/useGames'

export default function ClubHome() {
    const { clubId, clubName, clubSlug, loading: clubLoading } = useClub()
    const { games, loading } = useGames('2025/2026', clubId ?? undefined)
    const navigate = useNavigate()

    useEffect(() => {
        if (!clubLoading && !clubId) navigate('/', { replace: true })
    }, [clubLoading, clubId])

    if (clubLoading || (loading && !games.length)) {
        return <div className="flex justify-center py-20"><div className="w-6 h-6 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" /></div>
    }

    const finished = games.filter(g => g.status === 'FINALIZADO').sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    const scheduled = games.filter(g => g.status === 'AGENDADO' || g.status === 'A DECORRER').sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    const nextGame = scheduled[0]
    const lastGames = finished.slice(0, 5)
    const recentForm = lastGames.slice(0, 5).reverse().map(g => {
        const gaiaScore = g.equipa_casa.toUpperCase().includes(clubName.toUpperCase()) ? g.resultado_casa : g.resultado_fora
        const oppScore = g.equipa_casa.toUpperCase().includes(clubName.toUpperCase()) ? g.resultado_fora : g.resultado_casa
        if (gaiaScore === null || oppScore === null) return null
        if (gaiaScore > oppScore) return 'W'
        if (gaiaScore === oppScore) return 'D'
        return 'L'
    }).filter(Boolean) as ('W' | 'D' | 'L')[]

    return (
        <div className="max-w-xl mx-auto pb-24 px-3">
            <div className="flex items-center gap-3 mb-6 pt-4 animate-fade-in">
                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-500 text-sm">{clubName.charAt(0)}</div>
                <div>
                    <h1 className="text-lg font-black text-zinc-900 dark:text-white">{clubName}</h1>
                    <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Época 2025/2026</p>
                </div>
            </div>

            <div className="flex gap-2 mb-6">
                <Link to={`/clube/${clubSlug}/jogos`} className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm hover:border-amber-500/40 transition-all group">
                    <Calendar size={18} className="text-amber-500 mb-2" />
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Jogos</span>
                    <ArrowRight size={12} className="text-zinc-400 group-hover:text-amber-500 mt-1" />
                </Link>
                <Link to={`/clube/${clubSlug}/equipas`} className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm hover:border-amber-500/40 transition-all group">
                    <Users size={18} className="text-amber-500 mb-2" />
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Equipas</span>
                    <ArrowRight size={12} className="text-zinc-400 group-hover:text-amber-500 mt-1" />
                </Link>
                <Link to="/standings" className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm hover:border-amber-500/40 transition-all group">
                    <BarChart2 size={18} className="text-amber-500 mb-2" />
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Tabelas</span>
                    <ArrowRight size={12} className="text-zinc-400 group-hover:text-amber-500 mt-1" />
                </Link>
            </div>

            {nextGame && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm mb-4">
                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-3">Próximo Jogo</p>
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate flex-1">{nextGame.equipa_casa}</span>
                        <span className="text-xs font-black text-zinc-400 px-2">VS</span>
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate flex-1 text-right">{nextGame.equipa_fora}</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-2">
                        {new Date(nextGame.data).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}
                        {nextGame.hora && ` · ${nextGame.hora.slice(0, 5)}`}
                    </p>
                    {nextGame.local && <p className="text-[10px] text-zinc-400 mt-0.5">{nextGame.local}</p>}
                </div>
            )}

            {recentForm.length > 0 && (
                <div className="mb-4">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Forma Recente</p>
                    <div className="flex gap-1.5">
                        {recentForm.map((f, i) => (
                            <span key={i} className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                                f === 'W' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                                f === 'D' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                                'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                            }`}>{f === 'W' ? 'V' : f === 'D' ? 'E' : 'D'}</span>
                        ))}
                    </div>
                </div>
            )}

            {lastGames.length > 0 && (
                <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Últimos Resultados</p>
                    <div className="space-y-1.5">
                        {lastGames.map(g => {
                            const gaiaScore = g.equipa_casa.toUpperCase().includes(clubName.toUpperCase()) ? g.resultado_casa : g.resultado_fora
                            const oppScore = g.equipa_casa.toUpperCase().includes(clubName.toUpperCase()) ? g.resultado_fora : g.resultado_casa
                            const won = gaiaScore !== null && oppScore !== null && gaiaScore > oppScore
                            return (
                                <Link to={`/clube/${clubSlug}/jogo/${g.slug}`} key={g.slug} className="flex items-center gap-2 p-2.5 bg-white dark:bg-zinc-900/80 border border-zinc-100 dark:border-zinc-800/50 rounded-xl hover:border-amber-500/30 transition-all">
                                    {won ? <TrendingUp size={14} className="text-emerald-500 shrink-0" /> : g.resultado_casa === g.resultado_fora ? <Minus size={14} className="text-blue-500 shrink-0" /> : <TrendingDown size={14} className="text-red-500 shrink-0" />}
                                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{g.equipa_casa} {g.resultado_casa}-{g.resultado_fora} {g.equipa_fora}</span>
                                    <span className="text-[10px] text-zinc-400 ml-auto shrink-0">{new Date(g.data).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })}</span>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}
            <style>{`.animate-fade-in{animation:fadeIn .4s ease-out}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
        </div>
    )
}
