import { useMemo } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { Users, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useGames } from '../../hooks/useGames'
import { SkeletonGameGrid } from '../../components/Skeleton'
import { type Club } from '../../lib/ClubContext'

function ClubTeams() {
    const { club } = useOutletContext<{ club: Club }>()
    const { games: allGames, loading } = useGames('2025/2026', club.id)
    const games = allGames || []
    const clubNameUpper = club.name.toUpperCase()

    const teams = useMemo(() => {
        const escaloes = Array.from(new Set(games.map(g => g.escalao))).filter(Boolean).sort()
        return escaloes.map(escalao => {
            const teamGames = games.filter(g => g.escalao === escalao)
            const finished = teamGames.filter(g => g.status === 'FINALIZADO')
            const lastGame = finished.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0]

            let wins = 0, losses = 0, draws = 0
            finished.forEach(g => {
                const clubHome = g.equipa_casa.toUpperCase().includes(clubNameUpper)
                if (g.resultado_casa === null || g.resultado_fora === null) return
                if (g.resultado_casa === g.resultado_fora) { draws++; return }
                const clubWon = clubHome ? g.resultado_casa > g.resultado_fora : g.resultado_fora > g.resultado_casa
                if (clubWon) wins++
                else losses++
            })

            const total = wins + losses + draws
            const pct = total > 0 ? Math.round(wins / (wins + losses) * 100) : null

            let lastResult: 'W' | 'L' | 'D' | null = null
            if (lastGame && lastGame.resultado_casa !== null && lastGame.resultado_fora !== null) {
                const home = lastGame.equipa_casa.toUpperCase().includes(clubNameUpper)
                if (lastGame.resultado_casa === lastGame.resultado_fora) lastResult = 'D'
                else if (home ? lastGame.resultado_casa > lastGame.resultado_fora : lastGame.resultado_fora > lastGame.resultado_casa) lastResult = 'W'
                else lastResult = 'L'
            }

            return { escalao, wins, losses, draws, total, pct, lastResult, lastGame }
        })
    }, [games, clubNameUpper])

    if (loading) {
        return (
            <div className="max-w-xl mx-auto px-3">
                <SkeletonGameGrid days={2} count={3} />
            </div>
        )
    }

    if (teams.length === 0) {
        return (
            <div className="max-w-xl mx-auto px-3 py-20 text-center">
                <Users size={40} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
                <p className="text-sm text-zinc-500">Nenhuma equipa encontrada para {club.name}</p>
                <p className="text-xs text-zinc-400 mt-2">Os dados podem ainda não estar disponíveis. Volta mais tarde.</p>
            </div>
        )
    }

    return (
        <div className="max-w-xl mx-auto space-y-3 pb-20 px-3">
            <div className="pt-2 pb-1">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Equipas de {club.name}</h2>
                <p className="text-xs text-zinc-500 mt-1">{teams.length} escalões encontrados</p>
            </div>

            {teams.map(team => (
                <Link
                    key={team.escalao}
                    to={`/clube/${club.slug}/team/${encodeURIComponent(team.escalao)}`}
                    className="glass-card p-5 flex items-center justify-between gap-4 group animate-slide-up"
                >
                    <div className="flex items-center gap-4 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            team.lastResult === 'W' ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' :
                            team.lastResult === 'L' ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' :
                            team.lastResult === 'D' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
                            'bg-zinc-100 dark:bg-white/5 text-zinc-400'
                        }`}>
                            {team.lastResult === 'W' ? <TrendingUp size={20} /> :
                             team.lastResult === 'L' ? <TrendingDown size={20} /> :
                             team.lastResult === 'D' ? <Minus size={20} /> :
                             <Users size={20} />}
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-dribly-blue transition-colors truncate">
                                {team.escalao}
                            </h3>
                            <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                                {team.total > 0 && (
                                    <>
                                        <span className="text-green-600 dark:text-green-400 font-medium">{team.wins}V</span>
                                        <span className="text-red-500 font-medium">{team.losses}D</span>
                                        {team.pct !== null && (
                                            <span className="font-bold text-zinc-700 dark:text-zinc-300">{team.pct}%</span>
                                        )}
                                    </>
                                )}
                                {team.total === 0 && <span>Sem jogos</span>}
                            </div>
                        </div>
                    </div>
                    <ChevronRight size={16} className="text-zinc-400 group-hover:text-dribly-blue shrink-0 transition-colors" />
                </Link>
            ))}
        </div>
    )
}

export default ClubTeams
