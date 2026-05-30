import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Loader2 } from 'lucide-react'
import { useFollows } from '../hooks/useFollows'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

interface CompMeta {
    id: number; name: string; abrev: string; gradient_from: string; gradient_to: string; logo_url: string | null
}

export default function Leagues() {
    const { user } = useAuth()
    const { isFollowing, toggleFollow } = useFollows()
    const [comps, setComps] = useState<CompMeta[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.from('competitions_meta').select('*').order('id').then(({ data }) => {
            if (data) setComps(data as CompMeta[])
            setLoading(false)
        })
    }, [])

    const popularIds = new Set([10902, 10906, 10903, 10907, 10904])
    const cupIds = new Set([10917, 10920])
    const pop = comps.filter(c => popularIds.has(c.id))
    const cups = comps.filter(c => cupIds.has(c.id))

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-[#09090b] dark:via-zinc-950 dark:to-[#09090b]">
            <div className="max-w-4xl mx-auto px-3 sm:px-5 pt-6 sm:pt-8 pb-16">
                <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight mb-2 text-center">Ligas</h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mb-8 max-w-md mx-auto">
                    As principais competições da Federação Portuguesa de Basquetebol
                </p>

                {loading ? (
                    <div className="flex justify-center py-12"><Loader2 className="animate-spin text-dribly-purple" size={24} /></div>
                ) : (
                    <>
                        {pop.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Ligas Populares</h2>
                                <div className="space-y-2.5">{pop.map(c => <LeagueRow key={c.id} comp={c} isFollowed={!!user && isFollowing('competition', c.id)} showFollow={!!user} onToggleFollow={() => toggleFollow('competition', c.id)} />)}</div>
                            </div>
                        )}
                        {cups.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Taças</h2>
                                <div className="space-y-2.5">{cups.map(c => <LeagueRow key={c.id} comp={c} isFollowed={!!user && isFollowing('competition', c.id)} showFollow={!!user} onToggleFollow={() => toggleFollow('competition', c.id)} />)}</div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

function LeagueRow({ comp, isFollowed, showFollow, onToggleFollow }: { comp: CompMeta; isFollowed: boolean; showFollow: boolean; onToggleFollow: () => void }) {
    return (
        <div className="group flex items-center gap-3 bg-white dark:bg-zinc-900/90 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-4 hover:border-dribly-purple/40 dark:hover:border-dribly-purple/40 hover:shadow-md transition-all duration-200">
            <Link to={`/competicao/${comp.id}`} className="flex-1 min-w-0 flex items-center gap-3">
                {comp.logo_url ? (
                    <img src={comp.logo_url} alt="" className="w-12 h-12 rounded-2xl object-contain bg-white dark:bg-zinc-800 shrink-0 shadow-sm border border-zinc-100 dark:border-zinc-700" />
                ) : (
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${comp.gradient_from} ${comp.gradient_to} flex items-center justify-center shrink-0 shadow-sm`}>
                        <span className="text-[9px] font-black text-white tracking-tight">{comp.abrev}</span>
                    </div>
                )}
                <div className="min-w-0">
                    <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-dribly-purple dark:group-hover:text-dribly-purple transition-colors">{comp.name}</h3>
                </div>
                <svg className="w-4 h-4 shrink-0 text-zinc-300 group-hover:text-dribly-purple transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
            </Link>
            {showFollow && (
                <button onClick={(e) => { e.stopPropagation(); onToggleFollow() }}
                    className={`p-2 rounded-full transition-all active:scale-[0.9] ${isFollowed ? 'text-dribly-purple bg-dribly-purple/10 hover:bg-dribly-purple/20' : 'text-zinc-400 hover:text-dribly-purple hover:bg-dribly-purple/5'}`}
                    title={isFollowed ? 'Deixar de seguir' : 'Seguir'}>
                    <Heart size={16} strokeWidth={isFollowed ? 2.5 : 2} fill={isFollowed ? 'currentColor' : 'none'} />
                </button>
            )}
        </div>
    )
}
