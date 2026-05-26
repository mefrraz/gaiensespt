import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Loader2, Heart, Calendar, BarChart3, Trophy, Users, Star } from 'lucide-react'
import { useFollows } from '../hooks/useFollows'
import { useAuth } from '../lib/AuthContext'
import {
    fetchStandings, fetchSchedule, fetchResults, fetchTeams, fetchPlayerStats,
    type FPBStandingTeam, type FPBGame, type FPBTeam, type FPBPlayerStat
} from '../lib/fpbCompetitionsApi'
import { SegmentControl } from '../components/SegmentControl'

const TOP_LEAGUES = [10902, 10906] // Leagues with player stats

type Tab = 'classificacao' | 'resultados' | 'calendario' | 'equipas' | 'estatisticas'

export default function CompetitionDetail() {
    const { competitionId } = useParams<{ competitionId: string }>()
    const provaId = parseInt(competitionId || '0')
    const { user } = useAuth()
    const { isFollowing, toggleFollow } = useFollows()

    const [tab, setTab] = useState<Tab>('classificacao')
    const [standings, setStandings] = useState<FPBStandingTeam[]>([])
    const [games, setGames] = useState<FPBGame[]>([])
    const [teams, setTeams] = useState<FPBTeam[]>([])
    const [playerStats, setPlayerStats] = useState<FPBPlayerStat[]>([])
    const [loading, setLoading] = useState(true)

    // Fetch data based on active tab
    useEffect(() => {
        if (!provaId) return
        setLoading(true)

        const loadData = async () => {
            try {
                const results = await Promise.allSettled([
                    tab === 'classificacao' ? fetchStandings(provaId) : Promise.resolve([]),
                    tab === 'resultados' || tab === 'calendario' 
                        ? Promise.all([fetchSchedule(provaId), fetchResults(provaId)])
                        : Promise.resolve([[], []] as [FPBGame[], FPBGame[]]),
                    tab === 'equipas' ? fetchTeams(provaId) : Promise.resolve([]),
                    tab === 'estatisticas' && TOP_LEAGUES.includes(provaId)
                        ? fetchPlayerStats(provaId, 'val')
                        : Promise.resolve([]),
                ])

                if (results[0].status === 'fulfilled') setStandings(results[0].value)
                if (results[1].status === 'fulfilled') {
                    const [sched, res] = results[1].value as [FPBGame[], FPBGame[]]
                    // Merge: schedule games + results (results override if score exists)
                    const merged = new Map<string, FPBGame>()
                    for (const g of sched) merged.set(g.data + g.equipa_casa + g.equipa_fora, g)
                    for (const g of res) merged.set(g.data + g.equipa_casa + g.equipa_fora, g)
                    setGames(Array.from(merged.values()))
                }
                if (results[2].status === 'fulfilled') {
                    setTeams(results[2].value)
                }
                if (results[3].status === 'fulfilled') setPlayerStats(results[3].value)
            } catch (e) {
                console.error('Failed to load competition data:', e)
            }
            setLoading(false)
        }

        loadData()
    }, [provaId, tab])

    const tabs: { value: Tab; label: string; icon: React.ComponentType<any> }[] = [
        { value: 'classificacao', label: 'Classificação', icon: BarChart3 },
        { value: 'resultados', label: 'Resultados', icon: Trophy },
        { value: 'calendario', label: 'Calendário', icon: Calendar },
        { value: 'equipas', label: 'Equipas', icon: Users },
    ]
    if (TOP_LEAGUES.includes(provaId)) {
        tabs.push({ value: 'estatisticas', label: 'Estatísticas', icon: Star })
    }

    const followed = user ? isFollowing('competition', provaId) : false

    // Separate games into results (with scores) and schedule (no scores)
    const resultsList = games.filter(g => g.resultado_casa !== undefined && g.resultado_fora !== undefined)
    const scheduleList = games.filter(g => g.resultado_casa === undefined || g.resultado_fora === undefined)
    // Sort both by date
    resultsList.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    scheduleList.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())

    const formatDate = (d: string) => {
        const date = new Date(d)
        return date.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-[#09090b] dark:via-zinc-950 dark:to-[#09090b]">
            <div className="max-w-4xl mx-auto px-3 sm:px-5 pt-6 pb-16">
                <Link to="/ligas"
                    className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors mb-4 group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                    Ligas
                </Link>

                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                        Competição {provaId}
                    </h1>
                    {user && (
                        <button
                            onClick={() => toggleFollow('competition', provaId)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-[0.97] ${
                                followed
                                    ? 'text-dribly-purple bg-dribly-purple/10 border border-dribly-purple/30'
                                    : 'text-zinc-500 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 hover:border-dribly-purple/30 hover:text-dribly-purple'
                            }`}
                        >
                            <Heart size={14} strokeWidth={followed ? 2.5 : 2} fill={followed ? 'currentColor' : 'none'} />
                            {followed ? 'A seguir' : 'Seguir'}
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="mb-5">
                    <SegmentControl
                        options={tabs.map(t => ({ value: t.value, label: t.label }))}
                        value={tab}
                        onChange={(v) => setTab(v as Tab)}
                    />
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <Loader2 className="animate-spin text-dribly-purple" size={28} />
                        <span className="text-sm text-zinc-400">A carregar...</span>
                    </div>
                ) : (
                    <>
                        {/* Standings */}
                        {tab === 'classificacao' && (
                            standings.length === 0 ? (
                                <Empty text="Sem dados de classificação." />
                            ) : (
                                <div className="bg-white dark:bg-zinc-900/60 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-zinc-50 dark:bg-zinc-800/40">
                                                    <th className="pl-3 pr-1 py-2.5 text-center text-[10px] font-bold text-zinc-400 uppercase w-10">#</th>
                                                    <th className="pl-2 pr-3 py-2.5 text-left text-[10px] font-bold text-zinc-400 uppercase">Equipa</th>
                                                    <th className="px-2 py-2.5 text-center text-[10px] font-bold text-zinc-400 uppercase w-12">Pts</th>
                                                    <th className="px-2 py-2.5 text-center text-[10px] font-bold text-zinc-400 uppercase w-10">J</th>
                                                    <th className="px-2 py-2.5 text-center text-[10px] font-bold text-zinc-400 uppercase w-10">V</th>
                                                    <th className="px-2 py-2.5 text-center text-[10px] font-bold text-zinc-400 uppercase w-10">D</th>
                                                    <th className="hidden sm:table-cell px-2 py-2.5 text-center text-[10px] font-bold text-zinc-400 uppercase w-14">PM</th>
                                                    <th className="hidden sm:table-cell pr-3 pl-2 py-2.5 text-center text-[10px] font-bold text-zinc-400 uppercase w-14">PS</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/30">
                                                {standings.map((team, i) => (
                                                    <tr key={i} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/20">
                                                        <td className="pl-3 pr-1 py-2.5 text-center">
                                                            <span className="text-xs font-semibold text-zinc-400 tabular-nums">{team.posicao}</span>
                                                        </td>
                                                        <td className="pl-2 pr-3 py-2.5">
                                                            <div className="flex items-center gap-2">
                                                                {team.logo && <img src={team.logo} alt="" className="w-6 h-6 object-contain rounded-full bg-zinc-50" />}
                                                                <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-[160px] sm:max-w-[300px]">{team.equipa}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-2 py-2.5 text-center"><span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 tabular-nums">{team.pts}</span></td>
                                                        <td className="px-2 py-2.5 text-center"><span className="text-xs text-zinc-500 tabular-nums">{team.j}</span></td>
                                                        <td className="px-2 py-2.5 text-center"><span className="text-xs font-medium text-emerald-600 tabular-nums">{team.v}</span></td>
                                                        <td className="px-2 py-2.5 text-center"><span className="text-xs font-medium text-red-500 tabular-nums">{team.d}</span></td>
                                                        <td className="hidden sm:table-cell px-2 py-2.5 text-center"><span className="text-xs text-zinc-500 tabular-nums">{team.pm ?? '—'}</span></td>
                                                        <td className="hidden sm:table-cell pr-3 pl-2 py-2.5 text-center"><span className="text-xs text-zinc-500 tabular-nums">{team.ps ?? '—'}</span></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )
                        )}

                        {/* Results */}
                        {tab === 'resultados' && (
                            resultsList.length === 0 ? <Empty text="Sem resultados disponíveis." /> : (
                                <div className="space-y-2">
                                    {resultsList.map((g, i) => (
                                        <div key={i} className="flex items-center gap-3 bg-white dark:bg-zinc-900/90 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-4">
                                            <div className="text-center shrink-0 w-16">
                                                <p className="text-[10px] font-bold text-zinc-400 uppercase">{g.jornada ? `J${g.jornada}` : ''}</p>
                                                <p className="text-[11px] text-zinc-500">{formatDate(g.data)}</p>
                                            </div>
                                            <div className="flex-1 text-center">
                                                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{g.equipa_casa} <span className="text-base font-black text-dribly-purple mx-1">{g.resultado_casa}</span> — <span className="text-base font-black text-dribly-purple mx-1">{g.resultado_fora}</span> {g.equipa_fora}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}

                        {/* Schedule */}
                        {tab === 'calendario' && (
                            scheduleList.length === 0 ? <Empty text="Sem jogos agendados." /> : (
                                <div className="space-y-2">
                                    {scheduleList.map((g, i) => (
                                        <div key={i} className="flex items-center gap-3 bg-white dark:bg-zinc-900/90 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-4">
                                            <div className="text-center shrink-0 w-16">
                                                <p className="text-[10px] font-bold text-zinc-400 uppercase">{formatDate(g.data)}</p>
                                                {g.hora && <p className="text-[11px] font-bold text-dribly-purple">{g.hora}</p>}
                                            </div>
                                            <div className="flex-1 text-center">
                                                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{g.equipa_casa} <span className="text-zinc-400 mx-1">vs</span> {g.equipa_fora}</p>
                                                {g.pavilhao && <p className="text-[10px] text-zinc-400 mt-0.5">{g.pavilhao}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}

                        {/* Teams */}
                        {tab === 'equipas' && (
                            teams.length === 0 ? <Empty text="Sem dados de equipas." /> : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                                    {teams.map((team, i) => (
                                        <div key={i} className="bg-white dark:bg-zinc-900/90 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-4 text-center hover:border-dribly-purple/30 transition-all">
                                            {team.logo ? (
                                                <img src={team.logo} alt="" className="w-12 h-12 mx-auto object-contain rounded-full bg-zinc-50 mb-2" />
                                            ) : (
                                                <div className="w-12 h-12 mx-auto rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-2">
                                                    <span className="text-sm font-bold text-zinc-500">{team.nome.charAt(0)}</span>
                                                </div>
                                            )}
                                            <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 leading-tight truncate">{team.nome}</p>
                                            {team.associacao && <p className="text-[10px] text-zinc-400 mt-0.5 truncate">{team.associacao}</p>}
                                        </div>
                                    ))}
                                </div>
                            )
                        )}

                        {/* Player Stats */}
                        {tab === 'estatisticas' && (
                            playerStats.length === 0 ? <Empty text="Sem estatísticas disponíveis." /> : (
                                <div className="bg-white dark:bg-zinc-900/60 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-zinc-50 dark:bg-zinc-800/40">
                                                    <th className="pl-3 pr-1 py-2.5 text-center text-[10px] font-bold text-zinc-400 uppercase w-10">#</th>
                                                    <th className="pl-2 pr-3 py-2.5 text-left text-[10px] font-bold text-zinc-400 uppercase">Jogador</th>
                                                    <th className="px-2 py-2.5 text-center text-[10px] font-bold text-zinc-400 uppercase w-12">J</th>
                                                    <th className="px-2 py-2.5 text-center text-[10px] font-bold text-zinc-400 uppercase w-12">Pts</th>
                                                    <th className="hidden sm:table-cell px-2 py-2.5 text-center text-[10px] font-bold text-zinc-400 uppercase w-12">REB</th>
                                                    <th className="hidden sm:table-cell px-2 py-2.5 text-center text-[10px] font-bold text-zinc-400 uppercase w-12">AST</th>
                                                    <th className="pr-3 pl-2 py-2.5 text-center text-[10px] font-bold text-zinc-400 uppercase w-12">VAL</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/30">
                                                {playerStats.map((p, i) => (
                                                    <tr key={p.atleta_id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/20">
                                                        <td className="pl-3 pr-1 py-2.5 text-center">
                                                            <span className="text-xs font-semibold text-zinc-400 tabular-nums">{i + 1}</span>
                                                        </td>
                                                        <td className="pl-2 pr-3 py-2.5">
                                                            <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate block max-w-[180px]">{p.nome}</span>
                                                            <span className="text-[10px] text-zinc-400">{p.clube_nome}</span>
                                                        </td>
                                                        <td className="px-2 py-2.5 text-center"><span className="text-xs text-zinc-500 tabular-nums">{p.j}</span></td>
                                                        <td className="px-2 py-2.5 text-center"><span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 tabular-nums">{p.pts}</span></td>
                                                        <td className="hidden sm:table-cell px-2 py-2.5 text-center"><span className="text-xs text-zinc-500 tabular-nums">{p.reb ?? '—'}</span></td>
                                                        <td className="hidden sm:table-cell px-2 py-2.5 text-center"><span className="text-xs text-zinc-500 tabular-nums">{p.ast ?? '—'}</span></td>
                                                        <td className="pr-3 pl-2 py-2.5 text-center"><span className="text-xs font-bold text-dribly-purple tabular-nums">{p.val.toFixed(1)}</span></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

function Empty({ text }: { text: string }) {
    return (
        <div className="text-center py-16 bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60">
            <p className="text-sm text-zinc-400">{text}</p>
        </div>
    )
}