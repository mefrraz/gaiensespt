import { useState, useEffect } from 'react'
import { Star, Heart, Trophy, ArrowRight, Loader2, Check, X } from 'lucide-react'
import { useClub, type Club } from '../lib/ClubContext'
import { useFollows } from '../hooks/useFollows'
import { supabase } from '../lib/supabase'

interface Competition {
    competition_id: number
    competition_name: string
    association_name: string
}

const KEY = 'dribly_suggestions_done'

export function isSuggestionsDone(): boolean {
    return localStorage.getItem(KEY) === 'true'
}

export function markSuggestionsDone(): void {
    localStorage.setItem(KEY, 'true')
}

const FAVORITE_SUGGESTIONS = ['fc-porto', 'sl-benfica', 'sporting-cp', 'ud-oliveirense']

const FOLLOW_SUGGESTIONS = [
    'sc-lusitania', 'vitoria-sc', 'galitos-barreiro', 'cd-povoa',
    'sangalhos-dc', 'ovar-basquete',
]

const COMP_SUGGESTIONS = [
    'Liga Betclic', 'Proliga', 'Taça de Portugal',
    'Troféu António Pratas', 'Campeonato Nacional Sub-18',
]

interface Props {
    onComplete: () => void
}

export function PostOnboardingSuggestions({ onComplete }: Props) {
    const { clubs, loadClubs, favoriteClub, setFavoriteClub } = useClub()
    const { toggleFollow, follows } = useFollows()
    const [competitions, setCompetitions] = useState<Competition[]>([])
    const [loading, setLoading] = useState(true)

    // Wizard step: 0 = pick favorite, 1 = follow clubs & comps
    const [step, setStep] = useState(0)
    const [visible, setVisible] = useState(false)
    const [exiting, setExiting] = useState(false)

    const [favoritedId, setFavoritedId] = useState<number | null>(favoriteClub?.id ?? null)
    const [followedClubIds, setFollowedClubIds] = useState<Set<number>>(new Set())
    const [followedCompIds, setFollowedCompIds] = useState<Set<number>>(new Set())

    useEffect(() => { loadClubs() }, [])

    useEffect(() => {
        supabase
            .from('competitions')
            .select('competition_id, competition_name, association_name')
            .eq('season', '2025/2026')
            .then(({ data }) => {
                if (data) {
                    const seen = new Map<number, Competition>()
                    ;(data as Competition[]).forEach(c => {
                        if (!seen.has(c.competition_id)) seen.set(c.competition_id, c)
                    })
                    setCompetitions(Array.from(seen.values()))
                }
                setLoading(false)
            })
    }, [])

    useEffect(() => {
        setFollowedClubIds(new Set(follows.filter(f => f.entity_type === 'club').map(f => f.entity_id)))
        setFollowedCompIds(new Set(follows.filter(f => f.entity_type === 'competition').map(f => f.entity_id)))
    }, [follows])

    // Fade in
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 300)
        return () => clearTimeout(t)
    }, [])

    const favClubs = FAVORITE_SUGGESTIONS
        .map(slug => clubs.find(c => c.slug === slug))
        .filter(Boolean) as Club[]

    const followClubs = FOLLOW_SUGGESTIONS
        .map(slug => clubs.find(c => c.slug === slug))
        .filter(Boolean) as Club[]

    const suggestedComps = competitions
        .filter(c => COMP_SUGGESTIONS.some(n => c.competition_name.toLowerCase().includes(n.toLowerCase())))
        .slice(0, 5)

    const handleFavorite = async (club: Club) => {
        setFavoriteClub(club)
        setFavoritedId(club.id)
        if (!followedClubIds.has(club.id)) {
            await toggleFollow('club', club.id)
            setFollowedClubIds(prev => new Set(prev).add(club.id))
        }
    }

    const handleFollowClub = async (clubId: number) => {
        await toggleFollow('club', clubId)
        setFollowedClubIds(prev => {
            const next = new Set(prev)
            next.has(clubId) ? next.delete(clubId) : next.add(clubId)
            return next
        })
    }

    const handleFollowComp = async (compId: number) => {
        await toggleFollow('competition', compId)
        setFollowedCompIds(prev => {
            const next = new Set(prev)
            next.has(compId) ? next.delete(compId) : next.add(compId)
            return next
        })
    }

    const goNext = () => {
        setVisible(false)
        setTimeout(() => {
            setStep(1)
            setTimeout(() => setVisible(true), 80)
        }, 200)
    }

    const finish = () => {
        setExiting(true)
        setTimeout(() => {
            markSuggestionsDone()
            onComplete()
        }, 300)
    }

    return (
        <div
            className={`fixed inset-0 z-[199] flex items-center justify-center p-4 transition-all duration-400 ${
                exiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Card */}
            <div
                className={`relative z-10 w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-white/10 p-6 transition-all duration-300 ${
                    visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-[0.97]'
                }`}
            >
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 size={24} className="animate-spin text-dribly-purple" />
                    </div>
                ) : step === 0 ? (
                    /* ---- Step 0: Pick favorite club ---- */
                    <>
                        <button
                            onClick={finish}
                            className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
                        >
                            <X size={16} />
                        </button>

                        <div className="w-12 h-12 mx-auto rounded-full bg-yellow-100 dark:bg-yellow-500/10 flex items-center justify-center mb-4">
                            <Star size={22} className="text-yellow-500 fill-yellow-500" />
                        </div>
                        <h3 className="text-lg font-black text-zinc-900 dark:text-white text-center mb-1">
                            Escolhe o teu clube
                        </h3>
                        <p className="text-xs text-zinc-400 text-center mb-5">
                            Vai aparecer no topo da navegação.
                        </p>

                        <div className="space-y-2 mb-5">
                            {favClubs.map(club => {
                                const isFav = favoritedId === club.id
                                return (
                                    <button
                                        key={club.id}
                                        onClick={() => handleFavorite(club)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl border text-sm font-medium transition-all active:scale-[0.98] ${
                                            isFav
                                                ? 'bg-yellow-50 dark:bg-yellow-500/10 border-yellow-300 dark:border-yellow-500/40 text-yellow-700 dark:text-yellow-400'
                                                : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:border-yellow-200 dark:hover:border-yellow-500/20'
                                        }`}
                                    >
                                        {club.logo_url ? (
                                            <img src={club.logo_url} alt="" className="w-8 h-8 object-contain rounded-full shrink-0" />
                                        ) : (
                                            <span className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-white/10 flex items-center justify-center text-xs font-bold shrink-0">
                                                {club.name.charAt(0)}
                                            </span>
                                        )}
                                        <span className="flex-1 text-left">{club.name}</span>
                                        {isFav && <Check size={16} className="text-yellow-500" />}
                                    </button>
                                )
                            })}
                        </div>

                        {/* Dots */}
                        <div className="flex items-center justify-center gap-1.5 mb-4">
                            <div className="w-6 h-1.5 rounded-full bg-dribly-purple" />
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                        </div>

                        <button
                            onClick={goNext}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-dribly-purple text-white text-sm font-bold hover:bg-dribly-purple/90 transition-all active:scale-[0.97] shadow-sm shadow-dribly-purple/20"
                        >
                            Seguinte <ArrowRight size={15} />
                        </button>
                        <button
                            onClick={finish}
                            className="block mx-auto mt-3 text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                        >
                            Saltar
                        </button>
                    </>
                ) : (
                    /* ---- Step 1: Follow clubs & competitions ---- */
                    <>
                        <button
                            onClick={finish}
                            className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
                        >
                            <X size={16} />
                        </button>

                        <div className="w-12 h-12 mx-auto rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center mb-4">
                            <Heart size={22} className="text-red-500 fill-red-500" />
                        </div>
                        <h3 className="text-lg font-black text-zinc-900 dark:text-white text-center mb-1">
                            Segue clubes e ligas
                        </h3>
                        <p className="text-xs text-zinc-400 text-center mb-5">
                            Os jogos aparecem nos Seguidos.
                        </p>

                        {/* Clubs to follow */}
                        {followClubs.length > 0 && (
                            <div className="mb-4">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Clubes</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {followClubs.map(club => {
                                        const isFav = favoritedId === club.id
                                        const isF = followedClubIds.has(club.id) || isFav
                                        return (
                                            <button
                                                key={club.id}
                                                onClick={() => !isFav && handleFollowClub(club.id)}
                                                disabled={isFav}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-[0.97] ${
                                                    isF
                                                        ? 'bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400'
                                                        : isFav
                                                        ? 'bg-yellow-50/50 dark:bg-yellow-500/5 border border-yellow-200/50 dark:border-yellow-500/20 text-yellow-600/70'
                                                        : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:border-red-200'
                                                }`}
                                            >
                                                {club.logo_url ? (
                                                    <img src={club.logo_url} alt="" className="w-4 h-4 object-contain rounded-full" />
                                                ) : (
                                                    <span className="text-[9px]">{club.name.charAt(0)}</span>
                                                )}
                                                {club.name}
                                                <Heart
                                                    size={12}
                                                    className={isF ? 'fill-red-500 text-red-500' : isFav ? 'fill-yellow-500 text-yellow-500' : 'text-zinc-300'}
                                                />
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Competitions to follow */}
                        {suggestedComps.length > 0 && (
                            <div className="mb-5">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Ligas</p>
                                <div className="space-y-1.5">
                                    {suggestedComps.map(comp => {
                                        const isF = followedCompIds.has(comp.competition_id)
                                        return (
                                            <button
                                                key={comp.competition_id}
                                                onClick={() => handleFollowComp(comp.competition_id)}
                                                className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-medium transition-all active:scale-[0.98] ${
                                                    isF
                                                        ? 'bg-dribly-purple/5 dark:bg-dribly-purple/10 border-dribly-purple/30 text-dribly-purple'
                                                        : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:border-dribly-purple/20'
                                                }`}
                                            >
                                                <Trophy size={14} className={isF ? 'text-dribly-purple' : 'text-zinc-300'} />
                                                <span className="flex-1 text-left truncate">{comp.competition_name}</span>
                                                {isF && <Check size={13} className="text-dribly-purple shrink-0" />}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Dots */}
                        <div className="flex items-center justify-center gap-1.5 mb-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                            <div className="w-6 h-1.5 rounded-full bg-dribly-purple" />
                        </div>

                        <button
                            onClick={finish}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-all active:scale-[0.97] shadow-sm shadow-green-500/25"
                        >
                            Começar <Check size={16} />
                        </button>
                        <button
                            onClick={finish}
                            className="block mx-auto mt-3 text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                        >
                            Mais tarde
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}
