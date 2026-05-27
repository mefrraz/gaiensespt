import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Loader2, Heart, Calendar, BarChart3, Trophy, Users } from 'lucide-react'
import { useFollows } from '../hooks/useFollows'
import { useAuth } from '../lib/AuthContext'
import { useClub } from '../lib/ClubContext'
import {
    fetchStandings, fetchSchedule, fetchResults, fetchTeams, fetchPlayerStats,
    type FPBStandingTeam, type FPBGame, type FPBTeam, type FPBPlayerStat
} from '../lib/fpbCompetitionsApi'
import { SegmentControl } from '../components/SegmentControl'
import { GameCard } from '../components/GameCard'
import { type Match } from '../components/types'

const TOP_LEAGUES = [10902, 10906]

type Tab = 'classificacao' | 'resultados' | 'calendario' | 'equipas' | 'estatisticas'

function normalize(s: string): string {
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

/** Build a map from normalized team name → logo URL from the clubs list */
function buildLogoMap(clubs: { name: string; logo_url: string | null }[]): Map<string, string> {
    const map = new Map<string, string>()
    for (const c of clubs) {
        if (c.logo_url) map.set(normalize(c.name), c.logo_url)
    }
    return map
}

/** Match a team name to a logo using the logo map */
function findLogo(teamName: string, logoMap: Map<string, string>): string | null {
    const n = normalize(teamName)
    // Exact match
    if (logoMap.has(n)) return logoMap.get(n)!
    // Partial: team name contains club name, or vice versa
    for (const [clubName, logo] of logoMap) {
        if (n.includes(clubName) || clubName.includes(n)) return logo
    }
    return null
}

function fpbGameToMatch(g: FPBGame, logoMap: Map<string, string>): Match {
    const slug = g.jogo_id || `${g.data}-${g.equipa_casa.toLowerCase().replace(/\s+/g, '-')}-${g.equipa_fora.toLowerCase().replace(/\s+/g, '-')}`
    const status: Match['status'] = g.estado === 'FINALIZADO' ? 'FINALIZADO' : 'AGENDADO'
    return {
        id: g.jogo_id || slug,
        slug,
        data: g.data,
        hora: g.hora || '',
        equipa_casa: g.equipa_casa,
        equipa_fora: g.equipa_fora,
        resultado_casa: g.resultado_casa ?? null,
        resultado_fora: g.resultado_fora ?? null,
        escalao: '',
        competicao: '',
        local: g.pavilhao || null,
        logotipo_casa: findLogo(g.equipa_casa, logoMap),
        logotipo_fora: findLogo(g.equipa_fora, logoMap),
        status,
    }
}

export default function CompetitionDetail() {
    const { competitionId } = useParams<{ competitionId: string }>()
    const provaId = parseInt(competitionId || '0')
    const { user } = useAuth()
    const { isFollowing, toggleFollow } = useFollows()
    const { clubs, loadClubs } = useClub()

    const [tab, setTab] = useState<Tab>('classificacao')
    const [standings, setStandings] = useState<FPBStandingTeam[]>([])
    const [games, setGames] = useState<FPBGame[]>([])
    const [teams, setTeams] = useState<FPBTeam[]>([])
    const [playerStats, setPlayerStats] = useState<FPBPlayerStat[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => { loadClubs() }, [])

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
                    const merged = new Map<string, FPBGame>()
                    for (const g of sched) merged.set(g.data + g.equipa_casa + g.equipa_fora, g)
                    for (const g of res) merged.set(g.data + g.equipa_casa + g.equipa_fora, g)
                    setGames(Array.from(merged.values()))
                }
                if (results[2].status === 'fulfilled') setTeams(results[2].value)
                if (results[3].status === 'fulfilled') setPlayerStats(results[3].value)
            } catch (e) {
                console.error('Failed to load competition data:', e)
            }
            setLoading(false)
        }

        loadData()
    }, [provaId, tab])

    const tabs = [
        { value: 'classificacao', label: 'Classificação', icon: BarChart3 },
        { value: 'resultados', label: 'Resultados', icon: Calendar },
        { value: 'calendario', label: 'Calendário', icon: Calendar },
        { value: 'equipas', label: 'Equipas', icon: Users },
        ...(TOP_LEAGUES.includes(provaId) ? [{ value: 'estatisticas' as Tab, label: 'Estatísticas', icon: Trophy }] : []),
    ]

    const isFollowed = user ? isFollowing('competition', provaId) : false

    const handleToggleFollow = async () => {
        if (!user) return
        await toggleFollow('competition', provaId)
    }

    const logoMap = useMemo(() => buildLogoMap(clubs), [clubs])

    // Separate games into schedule (without results) and results (with results)
    const scheduleList = useMemo(() =>
        games.filter(g => g.resultado_casa === undefined && g.resultado_fora === undefined)
            .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()),
        [games]
    )

    const resultsList = useMemo(() =>
        games.filter(g => g.resultado_casa !== undefined && g.resultado_fora !== undefined)
            .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()),
        [games]
    )

    if (!provaId) {
        return (
            <div className="max-w-xl mx-auto px-3 py-16 text-center">
                <p className="text-sm text-zinc-500">Competição não encontrada.</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-[#09090b] dark:via-zinc-950 dark:to-[#09090b]">
            <div className="max-w-4xl mx-auto px-3 sm:px-5 pt-6 pb-24">
                <div className="flex items-center justify-between mb-6">
                    <Link to="/ligas" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                        Voltar
                    </Link>

                    {user && (
                        <button
                            onClick={handleToggleFollow}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-[0.97] ${
                                isFollowed
                                    ? 'bg-dribly-purple/10 text-dribly-purple border border-dribly-purple/30'
                                    : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-white/10 hover:border-dribly-purple/30 hover:text-dribly-purple'
                            }`}
                        >
                            <Heart size={13} strokeWidth={isFollowed ? 2.5 : 2} fill={isFollowed ? 'currentColor' : 'none'} />
                            {isFollowed ? 'A seguir' : 'Seguir'}
                        </button>
                    )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white mb-6 tracking-tight">
                    Competição #{provaId}
                </h1>

                <SegmentControl options={tabs} value={tab} onChange={v => setTab(v as Tab)} />

                <div className="mt-5">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 size={24} className="animate-spin text-dribly-purple" />
                        </div>
                    ) : (
                        <>
                            {/* Standings */}
                            {tab === 'classificacao' && (
                                standings.length === 0
                                    ? <Empty text="Classificação não disponível." />
                                    : (
                                        <div className="bg-white dark:bg-zinc-900/60 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 overflow-hidden">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="bg-zinc-50 dark:bg-zinc-800/40">
                                                            <th className="pl-3 pr-1 py-2.5 text-center text-[10px] font-bold text-zinc-400 uppercase w-8">#</th>
                                                            <th className="pl-2 pr-3 py-2.5 text-left text-[10px] font-bold text-zinc-400 uppercase">Equipa</th>
                                                            <th className="px-2 py-2.5 text-center text-[10px] font-bold text-zinc-400 uppercase w-8">J</th>
                                                            <th className="px-2 py-2.5 text-center text-[10px] font-bold text-zinc-400 uppercase w-8">V</th>
                                                            <th className="px-2 py-2.5 text-center text-[10px] font-bold text-zinc-400 uppercase w-8">D</th>
                                                            <th className="hidden sm:table-cell px-2 py-2.5 text-center text-[10px] font-bold text-zinc-400 uppercase w-10">PM</th>
                                                            <th className="hidden sm:table-cell px-2 py-2.5 text-center text-[10px] font-bold text-zinc-400 uppercase w-10">PS</th>
                                                            <th className="pr-3 pl-2 py-2.5 text-center text-[10px] font-bold text-zinc-400 uppercase w-10">Pts</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/30">
                                                        {standings.map((team, i) => (
                                                            <tr key={i} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/20">
                                                                <td className="pl-3 pr-1 py-2.5 text-center">
                                                                    <span className="text-xs font-bold text-zinc-500 tabular-nums">{team.posicao}</span>
                                                                </td>
                                                                <td className="pl-2 pr-3 py-2.5">
                                                                    <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 break-words">{team.equipa}</span>
                                                                </td>
                                                                <td className="px-2 py-2.5 text-center"><span className="text-xs text-zinc-500 tabular-nums">{team.j}</span></td>
                                                                <td className="px-2 py-2.5 text-center"><span className="text-xs font-medium text-emerald-600 tabular-nums">{team.v}</span></td>
                                                                <td className="px-2 py-2.5 text-center"><span className="text-xs font-medium text-red-500 tabular-nums">{team.d}</span></td>
                                                                <td className="hidden sm:table-cell px-2 py-2.5 text-center"><span className="text-xs text-zinc-500 tabular-nums">{team.pm ?? '—'}</span></td>
                                                                <td className="hidden sm:table-cell px-2 py-2.5 text-center"><span className="text-xs text-zinc-500 tabular-nums">{team.ps ?? '—'}</span></td>
                                                                <td className="pr-3 pl-2 py-2.5 text-center"><span className="text-xs font-black text-zinc-900 dark:text-white tabular-nums">{team.pts}</span></td>
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
                                resultsList.length === 0
                                    ? <Empty text="Sem resultados disponíveis." />
                                    : <div className="space-y-2">{resultsList.map((g, i) => <GameCard key={i} match={fpbGameToMatch(g, logoMap)} mode="results" />)}</div>
                            )}

                            {/* Schedule */}
                            {tab === 'calendario' && (
                                scheduleList.length === 0
                                    ? <Empty text="Sem jogos agendados." />
                                    : <div className="space-y-2">{scheduleList.map((g, i) => <GameCard key={i} match={fpbGameToMatch(g, logoMap)} mode="agenda" />)}</div>
                            )}

                            {/* Teams */}
                            {tab === 'equipas' && (
                                teams.length === 0
                                    ? <Empty text="Sem dados de equipas." />
                                    : (
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
                                playerStats.length === 0
                                    ? <Empty text="Sem estatísticas disponíveis." />
                                    : (
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
