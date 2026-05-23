import { useState, useEffect, useMemo } from 'react'
import { ChevronDown, Loader2, Search, Trophy, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StandingsTable } from '../components/StandingsTable'
import { supabase } from '../lib/supabase'
import { useStandings } from '../hooks/useStandings'
import { Standing } from '../components/types'

const SEASONS = ['2025/2026', '2024/2025', '2023/2024', '2022/2023']

interface CompetitionMeta {
    competition_id: number
    competition_name: string
    association_name: string
    club_count: number
}

export default function Standings() {
    const [season, setSeason] = useState('2025/2026')
    const [competitions, setCompetitions] = useState<CompetitionMeta[]>([])
    const [compsLoading, setCompsLoading] = useState(true)
    const [selectedComp, setSelectedComp] = useState<CompetitionMeta | null>(null)
    const [search, setSearch] = useState('')
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
    const [showLoadingMessage, setShowLoadingMessage] = useState(false)

    const competitionIds = useMemo(
        () => selectedComp ? [selectedComp.competition_id] : undefined,
        [selectedComp]
    )

    const { standings, loading: standingsLoading, error, refresh } = useStandings(season, competitionIds)

    useEffect(() => {
        setShowLoadingMessage(false)
        if (!standingsLoading) return
        const timer = setTimeout(() => setShowLoadingMessage(true), 1500)
        return () => clearTimeout(timer)
    }, [standingsLoading])

    useEffect(() => {
        setSelectedComp(null)
        setOpenGroups({})
        setSearch('')
        setCompsLoading(true)
        loadCompetitions(season)
    }, [season])

    useEffect(() => {
        if (standings.length > 0) {
            const groups = [...new Set(standings.map(s => s.grupo))].sort().reverse()
            setOpenGroups(prev => {
                const next: Record<string, boolean> = { ...prev }
                groups.forEach(g => { if (!(g in next)) next[g] = true })
                return next
            })
        }
    }, [standings])

    async function loadCompetitions(season: string) {
        setCompsLoading(true)
        const tableSeason = season
        const { data } = await supabase
            .from('competitions')
            .select('competition_id, competition_name, association_name, club_names')
            .eq('season', tableSeason)
            .order('competition_name')

        if (data) {
            setCompetitions(
                data.map(row => ({
                    competition_id: row.competition_id as number,
                    competition_name: row.competition_name as string,
                    association_name: row.association_name as string,
                    club_count: Array.isArray(row.club_names) ? (row.club_names as string[]).length : 0,
                }))
            )
        }
        setCompsLoading(false)
    }

    const filteredComps = useMemo(() => {
        if (!search.trim()) return competitions
        const q = search.toLowerCase()
        return competitions.filter(c =>
            c.competition_name.toLowerCase().includes(q) ||
            c.association_name.toLowerCase().includes(q)
        )
    }, [competitions, search])

    const compGroups = useMemo(() => {
        const active = filteredComps.filter(c => c.club_count > 2)
        const empty = filteredComps.filter(c => c.club_count <= 2)
        return { active, empty }
    }, [filteredComps])

    const getStatus = (teams: Standing[]): 'active' | 'finished' => {
        if (season !== '2025/2026') return 'finished'
        if (teams.length === 0) return 'finished'
        return teams.every(t => t.is_finished === true) ? 'finished' : 'active'
    }

    const groups = [...new Set(standings.map(s => s.grupo))].sort((a, b) => b.localeCompare(a))
    const toggleGroup = (grupo: string) => setOpenGroups(prev => ({ ...prev, [grupo]: !prev[grupo] }))
    const isOpen = (grupo: string) => openGroups[grupo] !== false

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] animate-fadeIn pb-16 pt-4 px-3 sm:px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-5">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
                            <Trophy size={22} className="text-amber-500 shrink-0" />
                            Classificações
                        </h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                            Centro de classificações do basquetebol português
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <select
                                value={season}
                                onChange={e => setSeason(e.target.value)}
                                className="appearance-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 pr-8 text-sm font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-sm"
                            >
                                {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                        </div>
                        <Link
                            to="/"
                            className="hidden sm:flex items-center justify-center px-3.5 py-2 text-sm font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white transition-colors bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700"
                        >
                            ← Voltar
                        </Link>
                    </div>
                </div>

                {!selectedComp ? (
                    <>
                        <div className="relative mb-4">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Search size={16} className="text-zinc-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Pesquisar competição ou associação..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-amber-500/50 dark:focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all shadow-sm"
                            />
                        </div>

                        {compsLoading ? (
                            <div className="flex justify-center py-16">
                                <Loader2 className="animate-spin text-amber-500" size={28} />
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {compGroups.active.length > 0 && (
                                    <div>
                                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 px-1">
                                            Competições com atividade
                                        </h3>
                                        <div className="grid gap-2">
                                            {compGroups.active.map(comp => (
                                                <button
                                                    key={comp.competition_id}
                                                    onClick={() => setSelectedComp(comp)}
                                                    className="w-full text-left bg-white dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-3.5 hover:border-amber-500/40 dark:hover:border-amber-500/30 hover:shadow-md transition-all duration-200 group"
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors leading-snug">
                                                                {comp.competition_name}
                                                            </h4>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400">
                                                                    <MapPin size={10} />
                                                                    {comp.association_name}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <span className="shrink-0 text-xs font-medium text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                                                            {comp.club_count} equipas
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {compGroups.empty.length > 0 && search && (
                                    <div>
                                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 px-1">
                                            Sem atividade recente
                                        </h3>
                                        <div className="grid gap-2">
                                            {compGroups.empty.slice(0, 10).map(comp => (
                                                <button
                                                    key={comp.competition_id}
                                                    onClick={() => setSelectedComp(comp)}
                                                    className="w-full text-left bg-white/50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/40 rounded-2xl p-3 hover:border-zinc-200 dark:hover:border-zinc-700/60 transition-all duration-200"
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <h4 className="text-xs font-medium text-zinc-500 dark:text-zinc-400 leading-snug">
                                                                {comp.competition_name}
                                                            </h4>
                                                            <span className="text-[10px] text-zinc-400">{comp.association_name}</span>
                                                        </div>
                                                        <span className="shrink-0 text-[10px] text-zinc-400">{comp.club_count} equipas</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {filteredComps.length === 0 && !compsLoading && (
                                    <div className="text-center py-16">
                                        <p className="text-zinc-400 font-medium">Nenhuma competição encontrada.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => { setSelectedComp(null); setOpenGroups({}) }}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white transition-colors mb-5 group"
                        >
                            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                            Todas as competições
                        </button>

                        <div className="mb-5">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{selectedComp.competition_name}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-zinc-500">{selectedComp.association_name}</span>
                                <span className="text-zinc-300 dark:text-zinc-600">·</span>
                                <span className="text-sm text-zinc-500">{season}</span>
                            </div>
                        </div>

                        {standingsLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <Loader2 className="animate-spin text-amber-500" size={28} />
                                <span className={`text-sm text-zinc-400 font-medium transition-opacity duration-600 ${showLoadingMessage ? 'opacity-100' : 'opacity-0'}`}>
                                    A atualizar classificações...
                                </span>
                            </div>
                        ) : error ? (
                            <div className="text-center py-16 bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                                <p className="text-zinc-500 font-medium mb-1">{error}</p>
                                <button onClick={() => refresh()} className="text-sm font-bold text-amber-600 hover:text-amber-700 transition-colors">
                                    Tentar novamente
                                </button>
                            </div>
                        ) : groups.length === 0 ? (
                            <div className="text-center py-16 bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                                <p className="text-zinc-500 font-medium">Sem classificações disponíveis para esta competição.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {groups.map(grupo => {
                                    const teams = standings.filter(s => s.grupo === grupo)
                                    return (
                                        <StandingsTable
                                            key={grupo}
                                            grupo={grupo}
                                            teams={teams}
                                            isOpen={isOpen(grupo)}
                                            onToggle={() => toggleGroup(grupo)}
                                            status={getStatus(teams)}
                                        />
                                    )
                                })}
                            </div>
                        )}
                    </>
                )}

                {!selectedComp && (
                    <div className="mt-8 flex flex-wrap gap-3 text-[10px] font-medium text-zinc-400 px-1">
                        <span><span className="font-bold text-zinc-500 dark:text-zinc-300">Pts</span>: Pontos</span>
                        <span><span className="font-bold text-zinc-500 dark:text-zinc-300">J</span>: Jogos</span>
                        <span><span className="font-bold text-zinc-500 dark:text-zinc-300">V</span>: Vitórias</span>
                        <span><span className="font-bold text-zinc-500 dark:text-zinc-300">D</span>: Derrotas</span>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeIn { animation: fadeIn 0.35s ease-out forwards; }
                .duration-600 { transition-duration: 600ms; }
            `}</style>
        </div>
    )
}
