import { useState, useEffect, useMemo } from 'react'
import { ChevronDown, Loader2, Users, Trophy, Calendar } from 'lucide-react'
import { StandingsTable } from '../components/StandingsTable'
import { supabase } from '../lib/supabase'
import { useStandings } from '../hooks/useStandings'
import { Standing } from '../components/types'

const TUGABASKET_ASSETS = 'https://resultados.tugabasket.com/assets/images/logos'

const ASSOCIATION_LOGOS: Record<number, string> = {
    50: 'fpb.jpg', 1: 'ablisboa.jpg', 2: 'absetubal.jpg', 3: 'abaveiro.jpg',
    4: 'abporto.jpg', 5: 'abbraga.jpg', 6: 'abmadeira.jpg', 7: 'absantarem_novo.jpg',
    8: 'abcoimbra.jpg', 9: 'abalgarve.jpg', 10: 'abviseu.jpg', 11: 'ableiria.jpg',
    12: 'abalentejo.jpg', 13: 'abit.jpg', 14: 'abcastelobranco.jpg', 15: 'abbraganca.jpg',
    16: 'absaomiguel.jpg', 17: 'abviana.jpg', 18: 'abvilareal.jpg', 19: 'abifp.jpg',
    20: 'abguarda.jpg', 22: 'absantamaria.jpg', 24: 'abacores.jpg',
}

function logoUrl(id: number): string { const f = ASSOCIATION_LOGOS[id]; return f ? `${TUGABASKET_ASSETS}/${f}` : '' }

const SEASONS = Array.from({ length: 23 }, (_, i) => `${2025 - i}/${2026 - i}`)

interface AssociationMeta { association_id: number; association_name: string }
interface CompetitionMeta {
    competition_id: number; competition_name: string
    association_name: string; club_count: number; gender: 'M' | 'F' | 'O'
}

function detectGender(n: string): 'M' | 'F' | 'O' {
    const u = n.toUpperCase()
    if (u.includes('FEMININ')) return 'F'
    if (u.includes('MASCULIN')) return 'M'
    if (u.includes('FEM') && !u.includes('MASC')) return 'F'
    if (u.includes('MASC')) return 'M'
    return 'O'
}

type View = 'associations' | 'competitions' | 'phases'

export default function Standings() {
    const [season, setSeason] = useState('2025/2026')
    const [view, setView] = useState<View>('associations')
    const [animating, setAnimating] = useState(false)

    const [associations, setAssociations] = useState<AssociationMeta[]>([])
    const [assocsLoading, setAssocsLoading] = useState(true)
    const [selectedAssoc, setSelectedAssoc] = useState<AssociationMeta | null>(null)

    const [competitions, setCompetitions] = useState<CompetitionMeta[]>([])
    const [compsLoading, setCompsLoading] = useState(false)
    const [selectedCompId, setSelectedCompId] = useState<number | null>(null)
    const [selectedCompName, setSelectedCompName] = useState('')
    const [selectedCompAssoc, setSelectedCompAssoc] = useState('')
    const [activeTab, setActiveTab] = useState<'M' | 'F' | 'O'>('M')

    const [showLoadingMsg, setShowLoadingMsg] = useState(false)

    const cids = useMemo(() => view === 'phases' && selectedCompId ? [selectedCompId] : undefined, [view, selectedCompId])
    const { standings, loading: stLoading, error: stError, refresh } = useStandings(season, cids)

    useEffect(() => { setShowLoadingMsg(false); if (!stLoading) return; const t = setTimeout(() => setShowLoadingMsg(true), 1500); return () => clearTimeout(t) }, [stLoading])
    useEffect(() => { setAssocsLoading(true); loadAssociations(season) }, [season])
    useEffect(() => { if (view === 'associations') { setSelectedAssoc(null); setSelectedCompId(null); setAnimating(false) } }, [view])
    useEffect(() => { if (view === 'competitions') { setSelectedCompId(null); setAnimating(false) } }, [view])

    async function loadAssociations(s: string) {
        setAssocsLoading(true)
        const { data } = await supabase.from('competitions').select('association_id, association_name').eq('season', s).order('association_name')
        if (data) { const seen = new Set<number>(); const u: AssociationMeta[] = []; for (const r of data) { const id = r.association_id as number; if (!seen.has(id)) { seen.add(id); u.push({ association_id: id, association_name: r.association_name as string }) } }; setAssociations(u) }
        setAssocsLoading(false)
    }

    async function loadCompetitions(assocId: number) {
        setCompsLoading(true)
        const { data } = await supabase.from('competitions').select('competition_id, competition_name, association_name, club_names').eq('season', season).eq('association_id', assocId).order('competition_name')
        if (data) {
            const comps = data.map(r => ({ competition_id: r.competition_id as number, competition_name: r.competition_name as string, association_name: r.association_name as string, club_count: Array.isArray(r.club_names) ? (r.club_names as string[]).length : 0, gender: detectGender(r.competition_name as string) }))
            setCompetitions(comps)
            if (comps.some(c => c.gender === 'M')) setActiveTab('M'); else if (comps.some(c => c.gender === 'F')) setActiveTab('F'); else setActiveTab('O')
        }
        setCompsLoading(false)
    }

    function navigate(to: View, fn?: () => void) { setAnimating(true); setTimeout(() => { fn?.(); setView(to) }, 120) }

    const masculine = useMemo(() => competitions.filter(c => c.gender === 'M'), [competitions])
    const feminine = useMemo(() => competitions.filter(c => c.gender === 'F'), [competitions])
    const other = useMemo(() => competitions.filter(c => c.gender === 'O'), [competitions])

    const assocStats = useMemo(() => ({
        totalComps: competitions.length,
        mascCount: masculine.length,
        femCount: feminine.length,
    }), [competitions, masculine, feminine])

    // Calculate unique teams from raw data
    const [totalTeams, setTotalTeams] = useState(0)
    useEffect(() => {
        async function count() {
            if (!selectedAssoc) return
            const { data } = await supabase.from('competitions').select('club_names').eq('season', season).eq('association_id', selectedAssoc.association_id)
            if (data) { const all = new Set<string>(); data.forEach(r => { if (Array.isArray(r.club_names)) (r.club_names as string[]).forEach(n => all.add(n)) }); setTotalTeams(all.size) }
        }
        count()
    }, [selectedAssoc, season])

    const getStatus = (teams: Standing[]): 'active' | 'finished' => {
        if (season !== '2025/2026') return 'finished'
        if (!teams.length) return 'finished'
        return teams.every(t => t.is_finished === true) ? 'finished' : 'active'
    }

    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
    const groups = useMemo(() => [...new Set(standings.map(s => s.grupo))].sort((a, b) => b.localeCompare(a)), [standings])
    const toggleGroup = (g: string) => setOpenGroups(p => ({ ...p, [g]: !p[g] }))
    const isOpen = (g: string) => openGroups[g] ?? false

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-[#09090b] dark:via-zinc-950 dark:to-[#09090b]">
            <div className="max-w-6xl mx-auto px-3 sm:px-5 md:px-8 pt-6 sm:pt-8 pb-16">

                {/* ── HEADER ── */}
                {view !== 'associations' && (
                    <div className={`mb-5 sm:mb-6 transition-all duration-300 ${animating ? 'opacity-40 scale-[0.995]' : 'opacity-100 scale-100'}`}>
                        <div className="flex items-end justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <button onClick={() => navigate(view === 'phases' ? 'competitions' : 'associations', view === 'competitions' ? () => setSelectedAssoc(null) : undefined)}
                                    className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 shadow-sm hover:shadow hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group">
                                    <svg className="w-4 h-4 text-zinc-500 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
                                </button>
                                <div className="min-w-0">
                                    <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                                        {view === 'competitions' && (selectedAssoc?.association_name || 'Competições')}
                                        {view === 'phases' && <span className="line-clamp-2">{selectedCompName}</span>}
                                    </h1>
                                    {view === 'phases' && (
                                        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium mt-0.5 flex items-center gap-2">
                                            <span>{selectedCompAssoc}</span><span className="text-zinc-300 dark:text-zinc-600">·</span><span>{season}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="relative shrink-0">
                                <select value={season} onChange={e => { setSeason(e.target.value); if (view === 'competitions' && selectedAssoc) loadCompetitions(selectedAssoc.association_id); else setView('associations') }}
                                    className="appearance-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-3.5 pr-9 py-2.5 text-sm font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-600 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/20">
                                    {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                )}

                {/* ── SCREEN 1: ASSOCIATIONS ── */}
                {view === 'associations' && (
                    <div className={`transition-all duration-300 ${animating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
                        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight mb-6 text-center">
                            Classificações
                        </h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center -mt-4 mb-8 max-w-md mx-auto">
                            Escolha uma associação para ver as suas competições
                        </p>
                        {assocsLoading ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-4">
                                <Loader2 className="animate-spin text-amber-500" size={28} />
                                <span className="text-sm text-zinc-400 font-medium">A carregar associações...</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3.5">
                                {associations.map(a => (
                                    <button key={a.association_id}
                                        onClick={() => navigate('competitions', () => { setSelectedAssoc(a); loadCompetitions(a.association_id) })}
                                        className="group bg-white dark:bg-zinc-900/90 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 p-4 sm:p-5 shadow-sm hover:shadow-xl hover:border-zinc-300 dark:hover:border-zinc-600 hover:-translate-y-0.5 transition-all duration-200 flex flex-col items-center gap-3">
                                        <div className="w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] rounded-2xl bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-800/50 flex items-center justify-center p-3 border border-zinc-100 dark:border-zinc-700/50 shadow-inner group-hover:shadow-md transition-all duration-200">
                                            <img src={logoUrl(a.association_id)} alt={a.association_name}
                                                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                                                loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                                        </div>
                                        <span className="text-[11px] sm:text-xs font-bold text-zinc-600 dark:text-zinc-400 text-center leading-tight group-hover:text-zinc-900 dark:group-hover:text-white transition-colors line-clamp-2">
                                            {a.association_name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── SCREEN 2: COMPETITIONS ── */}
                {view === 'competitions' && (
                    <div className={`transition-all duration-300 ${animating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
                        {compsLoading ? (
                            <div className="flex flex-col items-center justify-center py-24 gap-4">
                                <Loader2 className="animate-spin text-amber-500" size={32} />
                                <span className="text-sm text-zinc-400 font-medium">A carregar competições...</span>
                            </div>
                        ) : (
                            <>
                                {/* Association profile card */}
                                {selectedAssoc && (
                                    <div className="bg-white dark:bg-zinc-900/90 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 p-5 sm:p-6 shadow-sm mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-800/50 flex items-center justify-center p-3 shrink-0 border border-zinc-100 dark:border-zinc-700/50 shadow-inner">
                                            <img src={logoUrl(selectedAssoc.association_id)} alt={selectedAssoc.association_name}
                                                className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                                        </div>
                                        <div className="flex-1 text-center sm:text-left min-w-0">
                                            <h2 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white">{selectedAssoc.association_name}</h2>
                                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Época {season}</p>
                                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-5 mt-3">
                                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                                                    <Trophy size={13} className="text-amber-500" /> {assocStats.totalComps} competições
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                                                    <Users size={13} className="text-emerald-500" /> {totalTeams} equipas
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                                                    <Calendar size={13} className="text-blue-500" /> {assocStats.mascCount} masc · {assocStats.femCount} fem
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Tabs */}
                                {(masculine.length > 0 || feminine.length > 0 || other.length > 0) && (
                                    <div className="flex gap-1.5 mb-5 bg-white dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-1.5 w-fit shadow-sm">
                                        {[{ label: 'Masculinas', key: 'M' as const, data: masculine }, { label: 'Femininas', key: 'F' as const, data: feminine }, { label: 'Outras', key: 'O' as const, data: other }].filter(t => t.data.length > 0).map(t => (
                                            <button key={t.key} onClick={() => setActiveTab(t.key)} className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${activeTab === t.key ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                                                {t.label}<span className="ml-1.5 opacity-50 text-[10px]">{t.data.length}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {(() => {
                                    const list = activeTab === 'M' ? masculine : activeTab === 'F' ? feminine : other
                                    if (!list.length) return <div className="text-center py-20 bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60"><p className="text-zinc-400 font-medium">Nenhuma competição nesta categoria.</p></div>
                                    return (
                                        <div className="space-y-2">
                                            {list.map(c => (
                                                <button key={c.competition_id}
                                                    onClick={() => navigate('phases', () => { setSelectedCompId(c.competition_id); setSelectedCompName(c.competition_name); setSelectedCompAssoc(c.association_name) })}
                                                    className="w-full text-left bg-white dark:bg-zinc-900/90 hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 hover:border-amber-500/40 dark:hover:border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200 group flex items-center justify-between gap-4">
                                                    <div className="min-w-0">
                                                        <h4 className="text-sm sm:text-base font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors leading-snug">{c.competition_name}</h4>
                                                        <p className="text-[11px] sm:text-xs text-zinc-400 mt-1">{c.club_count} equipas</p>
                                                    </div>
                                                    <div className="shrink-0">
                                                        <svg className="w-5 h-5 text-zinc-300 dark:text-zinc-600 group-hover:text-amber-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )
                                })()}

                                {competitions.length === 0 && (
                                    <div className="text-center py-20 bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60">
                                        <p className="text-zinc-400 font-medium">Nenhuma competição encontrada.</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* ── SCREEN 3: PHASES ── */}
                {view === 'phases' && (
                    <div className={`transition-all duration-300 ${animating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
                        {stLoading ? (
                            <div className="flex flex-col items-center justify-center py-24 gap-4">
                                <Loader2 className="animate-spin text-amber-500" size={32} />
                                <span className={`text-sm text-zinc-400 font-medium transition-opacity duration-600 ${showLoadingMsg ? 'opacity-100' : 'opacity-0'}`}>A atualizar classificações...</span>
                            </div>
                        ) : stError ? (
                            <div className="text-center py-20 bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60">
                                <p className="text-zinc-500 font-medium mb-3">{stError}</p>
                                <button onClick={refresh} className="text-sm font-bold text-amber-600 hover:text-amber-700 transition-colors">Tentar novamente</button>
                            </div>
                        ) : groups.length === 0 ? (
                            <div className="text-center py-20 bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60">
                                <p className="text-zinc-400 font-medium">Sem classificações disponíveis.</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-3 mb-10">
                                    {groups.map(g => {
                                        const t = standings.filter(s => s.grupo === g)
                                        return <StandingsTable key={g} grupo={g} teams={t} isOpen={isOpen(g)} onToggle={() => toggleGroup(g)} status={getStatus(t)} />
                                    })}
                                </div>
                                <div className="text-center border-t border-zinc-200 dark:border-zinc-800 pt-6">
                                    <div className="inline-flex flex-wrap gap-4 text-[10px] font-medium text-zinc-400 justify-center">
                                        <span><span className="font-bold text-zinc-500 dark:text-zinc-300">Pts</span> · Pontos</span>
                                        <span><span className="font-bold text-zinc-500 dark:text-zinc-300">J</span> · Jogos</span>
                                        <span><span className="font-bold text-zinc-500 dark:text-zinc-300">V</span> · Vitórias</span>
                                        <span><span className="font-bold text-zinc-500 dark:text-zinc-300">D</span> · Derrotas</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
            <style>{`.duration-600{transition-duration:600ms}.line-clamp-2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}`}</style>
        </div>
    )
}
