import { useState, useEffect } from 'react'
import { Star, Heart, Trophy, ArrowRight, Loader2 } from 'lucide-react'
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

// Clubs shown as favorite suggestion (first 4, user picks 1)
const FAVORITE_SUGGESTIONS = ['fc-porto', 'sl-benfica', 'sporting-cp', 'ud-oliveirense']

// Extra clubs to suggest following
const FOLLOW_SUGGESTIONS = [
    'fc-porto', 'sl-benfica', 'sporting-cp', 'ud-oliveirense',
    'sc-lusitania', 'vitoria-sc', 'galitos-barreiro', 'cd-povoa',
]

// Competition names to suggest following
const COMPETITION_SUGGESTIONS = [
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
    const [favoritedId, setFavoritedId] = useState<number | null>(favoriteClub?.id ?? null)
    const [followedClubIds, setFollowedClubIds] = useState<Set<number>>(new Set())
    const [followedCompIds, setFollowedCompIds] = useState<Set<number>>(new Set())
    const [exiting, setExiting] = useState(false)

    // Load clubs on mount
    useEffect(() => {
        loadClubs()
    }, [])

    // Load competitions
    useEffect(() => {
        supabase
            .from('competitions')
            .select('competition_id, competition_name, association_name')
            .eq('season', '2025/2026')
            .then(({ data }) => {
                if (data) {
                    const seen = new Map<number, Competition>()
                    ;(data as Competition[]).forEach((c) => {
                        if (!seen.has(c.competition_id)) seen.set(c.competition_id, c)
                    })
                    setCompetitions(Array.from(seen.values()))
                }
                setLoading(false)
            })
    }, [])

    // Sync followed IDs from useFollows
    useEffect(() => {
        const clubSet = new Set(follows.filter(f => f.entity_type === 'club').map(f => f.entity_id))
        const compSet = new Set(follows.filter(f => f.entity_type === 'competition').map(f => f.entity_id))
        setFollowedClubIds(clubSet)
        setFollowedCompIds(compSet)
    }, [follows])

    // Suggested clubs for favorite section
    const favClubs = FAVORITE_SUGGESTIONS
        .map(slug => clubs.find(c => c.slug === slug))
        .filter(Boolean) as Club[]

    // Suggested clubs for follow section (exclude already-favorited)
    const followClubs = FOLLOW_SUGGESTIONS
        .map(slug => clubs.find(c => c.slug === slug))
        .filter((c): c is Club => !!c && c.id !== favoritedId)
        .slice(0, 6)

    // Suggested competitions (filter by name match)
    const suggestedComps = competitions.filter(c =>
        COMPETITION_SUGGESTIONS.some(name =>
            c.competition_name.toLowerCase().includes(name.toLowerCase())
        )
    ).slice(0, 5)

    const handleFavorite = async (club: Club) => {
        setFavoriteClub(club)
        setFavoritedId(club.id)
        // Also auto-follow the favorited club
        if (!followedClubIds.has(club.id)) {
            await toggleFollow('club', club.id)
            setFollowedClubIds(prev => new Set(prev).add(club.id))
        }
    }

    const handleFollowClub = async (clubId: number) => {
        await toggleFollow('club', clubId)
        setFollowedClubIds(prev => {
            const next = new Set(prev)
            if (next.has(clubId)) next.delete(clubId)
            else next.add(clubId)
            return next
        })
    }

    const handleFollowComp = async (compId: number) => {
        await toggleFollow('competition', compId)
        setFollowedCompIds(prev => {
            const next = new Set(prev)
            if (next.has(compId)) next.delete(compId)
            else next.add(compId)
            return next
        })
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
            className={`fixed inset-0 z-[199] flex flex-col bg-zinc-50 dark:bg-zinc-950 transition-all duration-400 ${
                exiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-12 pb-4">
                <div>
                    <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                        Quase pronto!
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Personaliza a tua experiência
                    </p>
                </div>
                <button
                    onClick={finish}
                    className="px-4 py-2 rounded-full bg-dribly-purple text-white text-sm font-bold hover:bg-dribly-purple/90 transition-all active:scale-[0.97] shadow-sm shadow-dribly-purple/20"
                >
                    Continuar
                </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 pb-28 space-y-8">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={24} className="animate-spin text-dribly-purple" />
                    </div>
                ) : (
                    <>
                        {/* Section 1: Pick a favorite club */}
                        {favClubs.length > 0 && (
                            <section>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-7 h-7 rounded-full bg-yellow-100 dark:bg-yellow-500/10 flex items-center justify-center">
                                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                    </div>
                                    <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                                        Escolhe o teu clube favorito
                                    </h2>
                                </div>
                                <p className="text-[11px] text-zinc-400 mb-3">
                                    Vai aparecer no topo da navegação para acesso rápido.
                                </p>
                                <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                                    {favClubs.map(club => {
                                        const isFav = favoritedId === club.id
                                        return (
                                            <button
                                                key={club.id}
                                                onClick={() => handleFavorite(club)}
                                                className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-bold transition-all active:scale-[0.97] shrink-0 ${
                                                    isFav
                                                        ? 'bg-yellow-50 dark:bg-yellow-500/10 border-yellow-300 dark:border-yellow-500/40 text-yellow-600 dark:text-yellow-400 shadow-sm'
                                                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:border-yellow-300 dark:hover:border-yellow-500/30'
                                                }`}
                                            >
                                                {club.logo_url ? (
                                                    <img src={club.logo_url} alt="" className="w-5 h-5 object-contain rounded-full" />
                                                ) : (
                                                    <span className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-white/10 flex items-center justify-center text-[9px] font-bold">
                                                        {club.name.charAt(0)}
                                                    </span>
                                                )}
                                                {club.name}
                                            </button>
                                        )
                                    })}
                                </div>
                            </section>
                        )}

                        {/* Section 2: Follow more clubs */}
                        {followClubs.length > 0 && (
                            <section>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
                                        <Heart size={14} className="text-red-500 fill-red-500" />
                                    </div>
                                    <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                                        Segue mais clubes
                                    </h2>
                                </div>
                                <p className="text-[11px] text-zinc-400 mb-3">
                                    Os jogos destes clubes aparecem todos na página Seguidos.
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    {followClubs.map(club => {
                                        const isF = followedClubIds.has(club.id)
                                        const isFav = favoritedId === club.id
                                        return (
                                            <button
                                                key={club.id}
                                                onClick={() => handleFollowClub(club.id)}
                                                disabled={isFav}
                                                className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm font-medium transition-all active:scale-[0.97] text-left ${
                                                    isF
                                                        ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30'
                                                        : isFav
                                                        ? 'bg-yellow-50/50 dark:bg-yellow-500/5 border-yellow-200/50 dark:border-yellow-500/20 opacity-70'
                                                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10 hover:border-red-200 dark:hover:border-red-500/20'
                                                }`}
                                            >
                                                {club.logo_url ? (
                                                    <img src={club.logo_url} alt="" className="w-7 h-7 object-contain rounded-full shrink-0" />
                                                ) : (
                                                    <span className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-white/10 flex items-center justify-center text-[10px] font-bold shrink-0">
                                                        {club.name.charAt(0)}
                                                    </span>
                                                )}
                                                <span className="truncate text-xs">{club.name}</span>
                                                <div className="ml-auto shrink-0">
                                                    {isF ? (
                                                        <Heart size={14} className="text-red-500 fill-red-500" />
                                                    ) : isFav ? (
                                                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                                    ) : (
                                                        <Heart size={14} className="text-zinc-300 dark:text-zinc-600" />
                                                    )}
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            </section>
                        )}

                        {/* Section 3: Follow competitions */}
                        {suggestedComps.length > 0 && (
                            <section>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-7 h-7 rounded-full bg-dribly-purple/10 dark:bg-dribly-purple/20 flex items-center justify-center">
                                        <Trophy size={14} className="text-dribly-purple" />
                                    </div>
                                    <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                                        Segue competições
                                    </h2>
                                </div>
                                <p className="text-[11px] text-zinc-400 mb-3">
                                    Acompanha os resultados das tuas ligas favoritas.
                                </p>
                                <div className="space-y-2">
                                    {suggestedComps.map(comp => {
                                        const isF = followedCompIds.has(comp.competition_id)
                                        return (
                                            <button
                                                key={comp.competition_id}
                                                onClick={() => handleFollowComp(comp.competition_id)}
                                                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all active:scale-[0.98] text-left ${
                                                    isF
                                                        ? 'bg-dribly-purple/5 dark:bg-dribly-purple/10 border-dribly-purple/30'
                                                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10 hover:border-dribly-purple/20'
                                                }`}
                                            >
                                                <div className="w-9 h-9 rounded-lg bg-dribly-purple/10 dark:bg-dribly-purple/20 flex items-center justify-center shrink-0">
                                                    <Trophy size={16} className="text-dribly-purple" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate">
                                                        {comp.competition_name}
                                                    </p>
                                                    <p className="text-[11px] text-zinc-400">{comp.association_name}</p>
                                                </div>
                                                <Heart
                                                    size={16}
                                                    className={`shrink-0 transition-all ${
                                                        isF
                                                            ? 'text-dribly-purple fill-dribly-purple'
                                                            : 'text-zinc-300 dark:text-zinc-600'
                                                    }`}
                                                />
                                            </button>
                                        )
                                    })}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>

            {/* Bottom bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-t border-zinc-200 dark:border-white/10 px-5 py-4">
                <div className="flex items-center gap-3 max-w-lg mx-auto">
                    <button
                        onClick={finish}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full bg-dribly-purple text-white text-sm font-bold hover:bg-dribly-purple/90 transition-all active:scale-[0.97] shadow-sm shadow-dribly-purple/20"
                    >
                        Continuar <ArrowRight size={16} />
                    </button>
                </div>
                <button
                    onClick={finish}
                    className="block mx-auto mt-2 text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                >
                    Mais tarde
                </button>
            </div>
        </div>
    )
}
