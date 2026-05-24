import { useState, useEffect, useMemo } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Loader2, Trophy, Users, Calendar, ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'

const TUGABASKET_ASSETS = 'https://resultados.tugabasket.com/assets/images/logos'
const ASSOCIATION_LOGOS: Record<number, string> = {
    50: 'fpb.jpg', 1: 'ablisboa.jpg', 2: 'absetubal.jpg', 3: 'abaveiro.jpg',
    4: 'abporto.jpg', 5: 'abbraga.jpg', 6: 'abmadeira.jpg', 7: 'absantarem_novo.jpg',
    8: 'abcoimbra.jpg', 9: 'abalgarve.jpg', 10: 'abviseu.jpg', 11: 'ableiria.jpg',
    12: 'abalentejo.jpg', 13: 'abit.jpg', 14: 'abcastelobranco.jpg', 15: 'abbraganca.jpg',
    16: 'absaomiguel.jpg', 17: 'abviana.jpg', 18: 'abvilareal.jpg', 19: 'abifp.jpg',
    20: 'abguarda.jpg', 22: 'absantamaria.jpg', 24: 'abacores.jpg',
}
function logoUrl(id: number) { const f = ASSOCIATION_LOGOS[id]; return f ? `${TUGABASKET_ASSETS}/${f}` : '' }

function detectGender(n: string): 'M' | 'F' | 'O' {
    const u = n.toUpperCase()
    if (u.includes('FEMININ')) return 'F'
    if (u.includes('MASCULIN')) return 'M'
    if (u.includes('FEM') && !u.includes('MASC')) return 'F'
    if (u.includes('MASC')) return 'M'
    return 'O'
}

interface CompetitionMeta {
    competition_id: number; competition_name: string
    club_count: number; gender: 'M' | 'F' | 'O'
}

export default function AssociationCompetitions() {
    const { associationId } = useParams<{ associationId: string }>()
    const navigate = useNavigate()
    const id = parseInt(associationId || '0')

    const [name, setName] = useState('')
    const [comps, setComps] = useState<CompetitionMeta[]>([])
    const [loading, setLoading] = useState(true)
    const [totalTeams, setTotalTeams] = useState(0)
    const [activeTab, setActiveTab] = useState<'M' | 'F' | 'O'>('M')

    useEffect(() => {
        if (!id) return
        setLoading(true)
        loadData()
    }, [id])

    async function loadData() {
        const { data } = await supabase.from('competitions')
            .select('competition_id, competition_name, association_name, club_names')
            .eq('season', '2025/2026').eq('association_id', id).order('competition_name')

        if (data) {
            setName(data[0]?.association_name as string || '')
            const all = new Set<string>()
            const list: CompetitionMeta[] = data.map(r => {
                const names = Array.isArray(r.club_names) ? r.club_names as string[] : []
                names.forEach(n => all.add(n))
                return {
                    competition_id: r.competition_id as number,
                    competition_name: r.competition_name as string,
                    club_count: names.length,
                    gender: detectGender(r.competition_name as string),
                }
            })
            setComps(list)
            setTotalTeams(all.size)
            if (list.some(c => c.gender === 'M')) setActiveTab('M')
            else if (list.some(c => c.gender === 'F')) setActiveTab('F')
            else setActiveTab('O')
        }
        setLoading(false)
    }

    const masculine = useMemo(() => comps.filter(c => c.gender === 'M'), [comps])
    const feminine = useMemo(() => comps.filter(c => c.gender === 'F'), [comps])
    const other = useMemo(() => comps.filter(c => c.gender === 'O'), [comps])

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-[#09090b] dark:via-zinc-950 dark:to-[#09090b]">
            <div className="max-w-4xl mx-auto px-3 sm:px-5 pt-6 sm:pt-8 pb-16">
                <Link to="/standings"
                    className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors mb-6 group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                    Associações
                </Link>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <Loader2 className="animate-spin text-dribly-purple" size={32} />
                    </div>
                ) : (
                    <>
                        <div className="bg-white dark:bg-zinc-900/90 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 p-5 sm:p-6 shadow-sm mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-800/50 flex items-center justify-center p-3 shrink-0 border border-zinc-100 dark:border-zinc-700/50 shadow-inner">
                                <img src={logoUrl(id)} alt={name} className="w-full h-full object-contain"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                            </div>
                            <div className="flex-1 text-center sm:text-left min-w-0">
                                <h2 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white">{name}</h2>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Época 2025/2026</p>
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-5 mt-3">
                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                                        <Trophy size={13} className="text-dribly-purple" /> {comps.length} competições
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                                        <Users size={13} className="text-emerald-500" /> {totalTeams} equipas
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                                        <Calendar size={13} className="text-blue-500" /> {masculine.length} masc · {feminine.length} fem
                                    </span>
                                </div>
                            </div>
                        </div>

                        {(masculine.length > 0 || feminine.length > 0 || other.length > 0) && (
                            <div className="flex gap-1.5 mb-5 bg-white dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-1.5 w-fit shadow-sm">
                                {[{ label: 'Masculinas', key: 'M' as const, data: masculine },
                                  { label: 'Femininas', key: 'F' as const, data: feminine },
                                  { label: 'Outras', key: 'O' as const, data: other }]
                                  .filter(t => t.data.length > 0)
                                  .map(t => (
                                    <button key={t.key} onClick={() => setActiveTab(t.key)}
                                        className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                                            activeTab === t.key ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                        }`}>
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
                                            onClick={() => navigate(`/standings/${id}/${c.competition_id}`)}
                                            className="w-full text-left bg-white dark:bg-zinc-900/90 hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 hover:border-dribly-purple/30 dark:hover:border-dribly-purple/30 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200 group flex items-center justify-between gap-4">
                                            <div className="min-w-0">
                                                <h4 className="text-sm sm:text-base font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-dribly-purple dark:group-hover:text-dribly-purple transition-colors leading-snug">{c.competition_name}</h4>
                                                <p className="text-[11px] sm:text-xs text-zinc-400 mt-1">{c.club_count} equipas</p>
                                            </div>
                                            <svg className="w-5 h-5 shrink-0 text-zinc-300 dark:text-zinc-600 group-hover:text-dribly-purple transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                                        </button>
                                    ))}
                                </div>
                            )
                        })()}

                        {comps.length === 0 && (
                            <div className="text-center py-20 bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60">
                                <p className="text-zinc-400 font-medium">Nenhuma competição encontrada.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
