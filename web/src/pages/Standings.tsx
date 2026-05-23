import { useState, useEffect, useMemo } from 'react'
import { ChevronDown, Loader2, Trophy } from 'lucide-react'
import { StandingsTable } from '../components/StandingsTable'
import { supabase } from '../lib/supabase'
import { useStandings } from '../hooks/useStandings'
import { Standing } from '../components/types'

const SEASONS = ['2025/2026', '2024/2025', '2023/2024', '2022/2023']

const ASSOCIATION_LOGOS: Record<number, string> = {
    50: 'fpb.jpg',
    1: 'ablisboa.jpg',
    2: 'absetubal.jpg',
    3: 'abaveiro.jpg',
    4: 'abporto.jpg',
    5: 'abbraga.jpg',
    6: 'abmadeira.jpg',
    7: 'absantarem_novo.jpg',
    8: 'abcoimbra.jpg',
    9: 'abalgarve.jpg',
    10: 'abviseu.jpg',
    11: 'ableiria.jpg',
    12: 'abalentejo.jpg',
    13: 'abit.jpg',
    14: 'abcastelobranco.jpg',
    15: 'abbraganca.jpg',
    16: 'absaomiguel.jpg',
    17: 'abviana.jpg',
    18: 'abvilareal.jpg',
    19: 'abifp.jpg',
    20: 'abguarda.jpg',
    22: 'absantamaria.jpg',
    24: 'abacores.jpg',
}

interface AssociationMeta {
    association_id: number
    association_name: string
}

interface CompetitionMeta {
    competition_id: number
    competition_name: string
    association_name: string
    club_count: number
    gender: 'M' | 'F' | 'O'
}

function detectGender(name: string): 'M' | 'F' | 'O' {
    const u = name.toUpperCase()
    if (u.includes('FEMININ') || u.includes('FEM')) return 'F'
    if (u.includes('MASCULIN') || u.includes('MASC')) return 'M'
    return 'O'
}

function logoUrl(associationId: number): string {
    const file = ASSOCIATION_LOGOS[associationId]
    if (!file) return ''
    return `/api/tugabasket?path=/assets/images/logos/${file}`
}

type View = 'associations' | 'competitions' | 'phases'

export default function Standings() {
    const [season, setSeason] = useState('2025/2026')
    const [view, setView] = useState<View>('associations')
    const [transitioning, setTransitioning] = useState(false)

    const [associations, setAssociations] = useState<AssociationMeta[]>([])
    const [assocsLoading, setAssocsLoading] = useState(true)
    const [selectedAssoc, setSelectedAssoc] = useState<AssociationMeta | null>(null)

    const [competitions, setCompetitions] = useState<CompetitionMeta[]>([])
    const [compsLoading, setCompsLoading] = useState(false)
    const [selectedCompId, setSelectedCompId] = useState<number | null>(null)
    const [selectedCompName, setSelectedCompName] = useState('')
    const [selectedCompAssoc, setSelectedCompAssoc] = useState('')

    const [showLoadingMessage, setShowLoadingMessage] = useState(false)

    const competitionIds = useMemo(
        () => (view === 'phases' && selectedCompId ? [selectedCompId] : undefined),
        [view, selectedCompId]
    )

    const { standings, loading: standingsLoading, error } = useStandings(season, competitionIds)

    useEffect(() => {
        setShowLoadingMessage(false)
        if (!standingsLoading) return
        const timer = setTimeout(() => setShowLoadingMessage(true), 1500)
        return () => clearTimeout(timer)
    }, [standingsLoading])

    useEffect(() => {
        setAssocsLoading(true)
        loadAssociations(season)
    }, [season])

    useEffect(() => {
        if (view !== 'associations') return
        setSelectedAssoc(null)
        setSelectedCompId(null)
        setTransitioning(false)
    }, [view])

    useEffect(() => {
        if (view !== 'competitions') return
        setSelectedCompId(null)
        setTransitioning(false)
    }, [view])

    async function loadAssociations(s: string) {
        setAssocsLoading(true)
        const { data } = await supabase
            .from('competitions')
            .select('association_id, association_name')
            .eq('season', s)
            .order('association_name')

        if (data) {
            const seen = new Set<number>()
            const uniq: AssociationMeta[] = []
            for (const row of data) {
                const id = row.association_id as number
                if (!seen.has(id)) {
                    seen.add(id)
                    uniq.push({ association_id: id, association_name: row.association_name as string })
                }
            }
            setAssociations(uniq)
        }
        setAssocsLoading(false)
    }

    async function loadCompetitions(assocId: number) {
        setCompsLoading(true)
        const { data } = await supabase
            .from('competitions')
            .select('competition_id, competition_name, association_name, club_names')
            .eq('season', season)
            .eq('association_id', assocId)
            .order('competition_name')

        if (data) {
            setCompetitions(
                data.map(row => ({
                    competition_id: row.competition_id as number,
                    competition_name: row.competition_name as string,
                    association_name: row.association_name as string,
                    club_count: Array.isArray(row.club_names) ? (row.club_names as string[]).length : 0,
                    gender: detectGender(row.competition_name as string),
                }))
            )
        }
        setCompsLoading(false)
    }

    function selectAssoc(assoc: AssociationMeta) {
        setTransitioning(true)
        setTimeout(() => {
            setSelectedAssoc(assoc)
            loadCompetitions(assoc.association_id)
            setView('competitions')
        }, 150)
    }

    function selectComp(comp: CompetitionMeta) {
        setTransitioning(true)
        setTimeout(() => {
            setSelectedCompId(comp.competition_id)
            setSelectedCompName(comp.competition_name)
            setSelectedCompAssoc(comp.association_name)
            setView('phases')
        }, 150)
    }

    function goBack() {
        setTransitioning(true)
        setTimeout(() => {
            if (view === 'phases') setView('competitions')
            else if (view === 'competitions') setView('associations')
        }, 150)
    }

    const masculine = useMemo(() => competitions.filter(c => c.gender === 'M'), [competitions])
    const feminine = useMemo(() => competitions.filter(c => c.gender === 'F'), [competitions])
    const other = useMemo(() => competitions.filter(c => c.gender === 'O'), [competitions])

    const getStatus = (teams: Standing[]): 'active' | 'finished' => {
        if (season !== '2025/2026') return 'finished'
        if (teams.length === 0) return 'finished'
        return teams.every(t => t.is_finished === true) ? 'finished' : 'active'
    }

    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
    const groups = useMemo(() => [...new Set(standings.map(s => s.grupo))].sort((a, b) => b.localeCompare(a)), [standings])

    const toggleGroup = (g: string) => setOpenGroups(prev => ({ ...prev, [g]: !prev[g] }))
    const isOpen = (g: string) => openGroups[g] ?? false

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] pb-16 pt-4 px-3 sm:px-5 md:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className={`flex items-center justify-between gap-4 mb-6 transition-opacity duration-300 ${transitioning ? 'opacity-50' : 'opacity-100'}`}>
                    <div className="flex items-center gap-3 min-w-0">
                        {view !== 'associations' && (
                            <button
                                onClick={goBack}
                                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm transition-all group"
                            >
                                <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        )}
                        <div className="min-w-0">
                            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2 truncate">
                                <Trophy size={20} className="text-amber-500 shrink-0" />
                                {view === 'associations' && 'Classificações'}
                                {view === 'competitions' && selectedAssoc?.association_name}
                                {view === 'phases' && selectedCompName}
                            </h1>
                            {view === 'phases' && (
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                    {selectedCompAssoc} · {season}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="relative shrink-0">
                        <select
                            value={season}
                            onChange={e => { setSeason(e.target.value); setView('associations') }}
                            className="appearance-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-3 pr-8 py-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm transition-colors"
                        >
                            {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                    </div>
                </div>

                {/* --- SCREEN 1: ASSOCIATIONS --- */}
                {view === 'associations' && (
                    <div className={`transition-all duration-300 ${transitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
                        {assocsLoading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="animate-spin text-amber-500" size={28} />
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                                {associations.map(assoc => (
                                    <button
                                        key={assoc.association_id}
                                        onClick={() => selectAssoc(assoc)}
                                        className="group flex flex-col items-center gap-2.5 p-4 sm:p-5 bg-white dark:bg-zinc-900/80 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 hover:-translate-y-0.5"
                                    >
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center p-2.5 shadow-sm group-hover:shadow-md transition-shadow duration-200">
                                            <img
                                                src={logoUrl(assoc.association_id)}
                                                alt={assoc.association_name}
                                                className="w-full h-full object-contain"
                                                loading="lazy"
                                            />
                                        </div>
                                        <span className="text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 text-center leading-tight group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                                            {assoc.association_name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* --- SCREEN 2: COMPETITIONS BY GENDER --- */}
                {view === 'competitions' && (
                    <div className={`space-y-6 transition-all duration-300 ${transitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
                        {compsLoading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="animate-spin text-amber-500" size={28} />
                            </div>
                        ) : (
                            <>
                                {masculine.length > 0 && (
                                    <div>
                                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 px-1">Competições Masculinas</h3>
                                        <div className="space-y-2">
                                            {masculine.map(comp => (
                                                <button
                                                    key={comp.competition_id}
                                                    onClick={() => selectComp(comp)}
                                                    className="w-full text-left bg-white dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-3.5 sm:p-4 hover:border-amber-500/40 dark:hover:border-amber-500/30 hover:shadow-md transition-all duration-200 group"
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors leading-snug">
                                                                {comp.competition_name}
                                                            </h4>
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

                                {feminine.length > 0 && (
                                    <div>
                                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 px-1">Competições Femininas</h3>
                                        <div className="space-y-2">
                                            {feminine.map(comp => (
                                                <button
                                                    key={comp.competition_id}
                                                    onClick={() => selectComp(comp)}
                                                    className="w-full text-left bg-white dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-3.5 sm:p-4 hover:border-amber-500/40 dark:hover:border-amber-500/30 hover:shadow-md transition-all duration-200 group"
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors leading-snug">
                                                                {comp.competition_name}
                                                            </h4>
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

                                {other.length > 0 && (
                                    <div>
                                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 px-1">Outras Competições</h3>
                                        <div className="space-y-2">
                                            {other.map(comp => (
                                                <button
                                                    key={comp.competition_id}
                                                    onClick={() => selectComp(comp)}
                                                    className="w-full text-left bg-white dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-3.5 sm:p-4 hover:border-amber-500/40 dark:hover:border-amber-500/30 hover:shadow-md transition-all duration-200 group"
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors leading-snug">
                                                                {comp.competition_name}
                                                            </h4>
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

                                {competitions.length === 0 && (
                                    <div className="text-center py-16">
                                        <p className="text-zinc-400 font-medium">Nenhuma competição encontrada para esta associação.</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* --- SCREEN 3: PHASES --- */}
                {view === 'phases' && (
                    <div className={`transition-all duration-300 ${transitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
                        {standingsLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <Loader2 className="animate-spin text-amber-500" size={28} />
                                <span className={`text-sm text-zinc-400 font-medium transition-opacity duration-600 ${showLoadingMessage ? 'opacity-100' : 'opacity-0'}`}>
                                    A atualizar classificações...
                                </span>
                            </div>
                        ) : error ? (
                            <div className="text-center py-16 bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                                <p className="text-zinc-500 font-medium">{error}</p>
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
                    </div>
                )}

                <div className="mt-10 flex flex-wrap gap-4 text-[10px] font-medium text-zinc-400 px-1 justify-center">
                    <span><span className="font-bold text-zinc-500 dark:text-zinc-300">Pts</span>: Pontos</span>
                    <span><span className="font-bold text-zinc-500 dark:text-zinc-300">J</span>: Jogos</span>
                    <span><span className="font-bold text-zinc-500 dark:text-zinc-300">V</span>: Vitórias</span>
                    <span><span className="font-bold text-zinc-500 dark:text-zinc-300">D</span>: Derrotas</span>
                </div>
            </div>

            <style>{`
                .duration-600 { transition-duration: 600ms; }
            `}</style>
        </div>
    )
}
