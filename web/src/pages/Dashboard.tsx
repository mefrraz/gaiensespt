import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Calendar, Trophy, ChevronRight, Clock, MapPin, Loader2 } from 'lucide-react'

type Match = {
    slug: string
    data: string
    hora: string
    equipa_casa: string
    equipa_fora: string
    resultado_casa: number | null
    resultado_fora: number | null
    escalao: string
    competicao: string
    local: string | null
    logotipo_casa: string | null
    logotipo_fora: string | null
    status: 'AGENDADO' | 'A DECORRER' | 'FINALIZADO'
}


function Dashboard() {
    const [nextGame, setNextGame] = useState<Match | null>(null)
    const [upcomingGames, setUpcomingGames] = useState<Match[]>([])
    const [recentResults, setRecentResults] = useState<Match[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            const today = new Date().toISOString().split('T')[0]

            // Fetch next game and upcoming
            const { data: agendaData } = await supabase
                .from('games_2025_2026')
                .select('*')
                .neq('status', 'FINALIZADO')
                .gte('data', today)
                .order('data', { ascending: true })
                .order('hora', { ascending: true })
                .limit(4)

            if (agendaData && agendaData.length > 0) {
                setNextGame(agendaData[0] as Match)
                setUpcomingGames(agendaData.slice(1, 4) as Match[])
            }

            // Fetch recent results
            const { data: resultsData } = await supabase
                .from('games_2025_2026')
                .select('*')
                .eq('status', 'FINALIZADO')
                .order('data', { ascending: false })
                .limit(3)

            if (resultsData) {
                setRecentResults(resultsData as Match[])
            }

            setLoading(false)
        }

        fetchData()
    }, [])

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric', month: 'short' })
    }

    const formatDateShort = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })
    }

    const isGaiaWin = (match: Match) => {
        if (match.resultado_casa === null || match.resultado_fora === null) return null
        const gaiaHome = match.equipa_casa.toUpperCase().includes('GAIA')
        if (gaiaHome) {
            return match.resultado_casa > match.resultado_fora
        }
        return match.resultado_fora > match.resultado_casa
    }

    if (loading) {
        return (
            <div className="flex justify-center py-32">
                <Loader2 className="animate-spin text-gaia-yellow" size={32} />
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-20 px-2">

            {/* Hero: Next Game */}
            {nextGame && (
                <Link to={`/game/${nextGame.slug}`} className="block group">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-lg border border-zinc-100 dark:border-white/5 relative overflow-hidden group-hover:border-gaia-yellow/30 transition-all">
                        {/* Background pattern - Removed as requested for cleaner look */}

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold text-gaia-yellow uppercase tracking-widest">
                                    Próximo Jogo
                                </span>
                                <span className="text-xs font-bold text-zinc-500 uppercase">
                                    {nextGame.escalao}
                                </span>
                            </div>

                            {/* Watermark Logos */}
                            <div className="absolute inset-0 flex items-center justify-between px-10 pointer-events-none opacity-[0.06] dark:opacity-[0.08]">
                                {nextGame.logotipo_casa && <img src={nextGame.logotipo_casa} className="w-40 h-40 object-contain grayscale" />}
                                {nextGame.logotipo_fora && <img src={nextGame.logotipo_fora} className="w-40 h-40 object-contain grayscale" />}
                            </div>

                            <div className="flex items-center justify-between gap-4 mb-4">
                                {/* Home Team */}
                                <div className="flex-1 text-center">
                                    <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                                        {nextGame.logotipo_casa ? (
                                            <img src={nextGame.logotipo_casa} alt="" className="w-12 h-12 object-contain" />
                                        ) : (
                                            <span className="text-xl font-bold text-zinc-400">{nextGame.equipa_casa.charAt(0)}</span>
                                        )}
                                    </div>
                                    <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                                        {nextGame.equipa_casa}
                                    </p>
                                </div>

                                {/* VS */}
                                <div className="flex flex-col items-center">
                                    <span className="text-2xl font-black text-zinc-300 dark:text-zinc-600">VS</span>
                                </div>

                                {/* Away Team */}
                                <div className="flex-1 text-center">
                                    <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                                        {nextGame.logotipo_fora ? (
                                            <img src={nextGame.logotipo_fora} alt="" className="w-12 h-12 object-contain" />
                                        ) : (
                                            <span className="text-xl font-bold text-zinc-400">{nextGame.equipa_fora.charAt(0)}</span>
                                        )}
                                    </div>
                                    <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                                        {nextGame.equipa_fora}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-4 text-sm text-zinc-500">
                                <div className="flex items-center gap-1.5">
                                    <Clock size={14} className="text-gaia-yellow" />
                                    <span className="font-medium">{formatDate(nextGame.data)} · {(nextGame.hora || '00:00').slice(0, 5)}</span>
                                </div>
                            </div>

                            {nextGame.local && (
                                <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-zinc-400">
                                    <MapPin size={12} />
                                    <span className="truncate max-w-[200px]">{nextGame.local}</span>
                                </div>
                            )}

                            <div className="mt-4 flex items-center justify-center gap-1 text-xs text-gaia-yellow font-bold">
                                <span>Ver detalhes</span>
                                <ChevronRight size={14} />
                            </div>
                        </div>
                    </div>
                </Link>
            )}

            {/* Quick Links Grid - Bento Style */}
            <div className="grid grid-cols-2 gap-3">

                {/* Agenda / Games Action Card */}
                <Link to="/games?view=agenda" className="relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-900 p-5 flex flex-col justify-between h-32 group shadow-xl transition-transform active:scale-[0.98]">
                    <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                        <Calendar size={64} className="text-white transform rotate-12 translate-x-4 -translate-y-2" />
                    </div>

                    <div className="relative z-10 p-2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white mb-auto">
                        <Calendar size={20} />
                    </div>

                    <div className="relative z-10">
                        <h3 className="text-white font-bold text-lg leading-tight">Jogos<br />& Agenda</h3>
                    </div>
                </Link>

                {/* Standings Action Card */}
                <Link to="/standings" className="relative overflow-hidden rounded-2xl bg-gaia-yellow border border-gaia-yellow p-5 flex flex-col justify-between h-32 group shadow-xl shadow-yellow-500/10 transition-transform active:scale-[0.98]">
                    <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                        <Trophy size={64} className="text-black transform -rotate-12 translate-x-2 -translate-y-2" />
                    </div>

                    <div className="relative z-10 p-2 w-10 h-10 rounded-full bg-black/10 flex items-center justify-center text-black mb-auto">
                        <Trophy size={20} />
                    </div>

                    <div className="relative z-10">
                        <h3 className="text-black font-bold text-lg leading-tight">Tabelas<br />& Pontos</h3>
                    </div>
                </Link>
            </div>

            {/* Recent Results */}
            {
                recentResults.length > 0 && (
                    <div className="glass-card p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                                Últimos Resultados
                            </h3>
                            <Link to="/games?view=results" className="text-xs text-gaia-yellow font-bold flex items-center gap-1 hover:underline">
                                Ver todos <ChevronRight size={12} />
                            </Link>
                        </div>
                        <div className="space-y-2">
                            {recentResults.map(match => {
                                const won = isGaiaWin(match)
                                return (
                                    <Link
                                        to={`/game/${match.slug}`}
                                        key={match.slug}
                                        className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 -mx-2 px-2 rounded transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            {won === true && <div className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" />}
                                            {won === false && <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />}
                                            {won === null && <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />}
                                            <div className="text-xs">
                                                <span className={`font-medium ${won === true ? 'text-zinc-900 dark:text-white font-bold' : 'text-zinc-500'}`}>
                                                    {match.equipa_casa}
                                                </span>
                                                <span className="text-zinc-300 mx-1">vs</span>
                                                <span className={`font-medium ${won === false ? 'text-zinc-900 dark:text-white font-bold' : 'text-zinc-500'}`}>
                                                    {match.equipa_fora}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-mono font-bold ${won !== null ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>
                                                {match.resultado_casa} - {match.resultado_fora}
                                            </span>
                                            <span className="text-[10px] text-zinc-400">
                                                {formatDateShort(match.data)}
                                            </span>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                )
            }

            {/* Upcoming Games Preview */}
            {
                upcomingGames.length > 0 && (
                    <div className="glass-card p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                                Próximos Jogos
                            </h3>
                            <Link to="/games?view=agenda" className="text-xs text-gaia-yellow font-bold flex items-center gap-1 hover:underline">
                                Ver agenda <ChevronRight size={12} />
                            </Link>
                        </div>
                        <div className="space-y-2">
                            {upcomingGames.map(match => (
                                <Link
                                    to={`/game/${match.slug}`}
                                    key={match.slug}
                                    className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 -mx-2 px-2 rounded transition-colors"
                                >
                                    <div className="text-xs">
                                        <span className="font-medium text-zinc-900 dark:text-white">
                                            {match.equipa_casa}
                                        </span>
                                        <span className="text-zinc-400 mx-1">vs</span>
                                        <span className="font-medium text-zinc-900 dark:text-white">
                                            {match.equipa_fora}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                                        <span>{formatDateShort(match.data)}</span>
                                        <span className="font-mono">{(match.hora || '00:00').slice(0, 5)}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )
            }

        </div >
    )
}

export default Dashboard
