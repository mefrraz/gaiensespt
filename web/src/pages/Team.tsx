import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Match } from './Home'
import { ArrowLeft, Calendar, Loader2 } from 'lucide-react'


function Team() {
    const { teamName } = useParams()
    const [matches, setMatches] = useState<Match[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ wins: 0, draws: 0, losses: 0, scored: 0, conceded: 0 })

    useEffect(() => {
        const fetchTeamMatches = async () => {
            if (!teamName) return
            setLoading(true)

            // Fetch all matches where teamName matches either home or away
            // And implicitly one of them is Gaia (since we only seed Gaia games).
            // But to be safe, we just filter by the teamName param.
            const { data, error } = await supabase
                .from('partidas')
                .select('*')
                .or(`equipa_casa.eq.${teamName},equipa_fora.eq.${teamName}`)
                .order('data', { ascending: false })

            if (error) {
                console.error(error)
            } else {
                const finishedMatches = (data as Match[]).filter(m => m.status === 'FINALIZADO')
                setMatches(data as Match[])

                // Calculate Stats vs Gaia
                let wins = 0
                let draws = 0
                let losses = 0
                let scored = 0
                let conceded = 0

                finishedMatches.forEach(match => {
                    const isHome = match.equipa_casa === teamName

                    // We want stats from GAIA's perspective? Or the Opponent?
                    // Usually "vs Team" implies Gaia vs Team.
                    // Let's show Gaia's record against them.
                    // Actually, if I visit "Vasco da Gama", I want to see "Gaia vs Vasco da Gama" stats.
                    // So: Wins = Gaia Wins.

                    const gaiaIsHome = !isHome
                    const gaiaScore = gaiaIsHome ? match.resultado_casa : match.resultado_fora
                    const opponentScore = gaiaIsHome ? match.resultado_fora : match.resultado_casa

                    if (gaiaScore !== null && opponentScore !== null) {
                        if (gaiaScore > opponentScore) wins++
                        else if (gaiaScore < opponentScore) losses++
                        else draws++

                        scored += gaiaScore
                        conceded += opponentScore
                    }
                })

                setStats({ wins, draws, losses, scored, conceded })
            }
            setLoading(false)
        }

        fetchTeamMatches()
    }, [teamName])

    if (loading) return (
        <div className="flex justify-center py-32">
            <Loader2 className="animate-spin text-gaia-yellow" size={32} />
        </div>
    )

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link to="/" className="p-2 -ml-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                        FC Gaia vs {teamName}
                    </h1>
                    <p className="text-sm text-zinc-500">Histórico de Confrontos Diretos</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card p-4 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-zinc-900 dark:text-white">{matches.length}</span>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Jogos</span>
                </div>
                <div className="glass-card p-4 flex flex-col items-center justify-center bg-green-500/10 border-green-500/20">
                    <span className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.wins}</span>
                    <span className="text-[10px] font-bold text-green-600/80 dark:text-green-400/80 uppercase">Vitórias</span>
                </div>
                <div className="glass-card p-4 flex flex-col items-center justify-center bg-red-500/10 border-red-500/20">
                    <span className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.losses}</span>
                    <span className="text-[10px] font-bold text-red-600/80 dark:text-red-400/80 uppercase">Derrotas</span>
                </div>
                <div className="glass-card p-4 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-zinc-900 dark:text-white">{stats.scored} - {stats.conceded}</span>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Pontos +/-</span>
                </div>
            </div>

            {/* Match List */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-2">
                    Partidas Passadas
                </h3>
                {matches.map(match => (
                    <Link to={`/game/${match.slug}`} key={match.slug} className="glass-card flex items-center justify-between p-4 group hover:border-gaia-yellow/30 transition-colors">
                        <div className="flex flex-col gap-1">
                            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                <Calendar size={12} />
                                {new Date(match.data).toLocaleDateString('pt-PT', { year: 'numeric', month: 'short', day: 'numeric' })}
                                <span className="text-gaia-yellow">•</span>
                                {match.escalao}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`font-bold ${match.resultado_casa !== null && match.resultado_fora !== null && match.resultado_casa > match.resultado_fora ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>
                                    {match.equipa_casa}
                                </span>
                                <span className="text-zinc-400 text-xs">vs</span>
                                <span className={`font-bold ${match.resultado_fora !== null && match.resultado_casa !== null && match.resultado_fora > match.resultado_casa ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>
                                    {match.equipa_fora}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {match.status === 'FINALIZADO' ? (
                                <div className="text-xl font-mono font-bold text-zinc-900 dark:text-white bg-zinc-100 dark:bg-white/5 px-3 py-1 rounded-lg">
                                    {match.resultado_casa} - {match.resultado_fora}
                                </div>
                            ) : (
                                <div className="text-xs font-bold text-zinc-500 bg-zinc-100 dark:bg-white/5 px-2 py-1 rounded">
                                    {match.hora}
                                </div>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default Team
