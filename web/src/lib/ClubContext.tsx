import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'
import { supabase } from './supabase'

export interface Club {
    id: number
    name: string
    slug: string
    search_name: string
    logo_url: string | null
    primary_color?: string | null
}

const CLUB_COLOR_PALETTE = [
    '#7C3AED', // purple (default)
    '#3B82F6', // blue
    '#7C3AED', // purple
    '#DB2777', // pink
    '#DC2626', // red
    '#CA8A04', // amber
    '#16A34A', // green
    '#0891B2', // cyan
    '#4F46E5', // indigo
    '#9333EA', // violet
    '#EA580C', // orange
    '#059669', // emerald
    '#0D9488', // teal
]

function getPaletteColor(clubId: number): string {
    return CLUB_COLOR_PALETTE[clubId % CLUB_COLOR_PALETTE.length]
}

const DEFAULT_COLOR = '#7C3AED'

interface ClubContextType {
    selectedClub: Club | null
    setSelectedClub: (club: Club | null) => void
    favoriteClub: Club | null
    setFavoriteClub: (club: Club | null) => void
    clubs: Club[]
    loadClubs: () => Promise<void>
    getClubBySlug: (slug: string) => Promise<Club | null>
    clubColor: string
}

const ClubContext = createContext<ClubContextType | null>(null)

const FAVORITE_KEY = 'dribly_favorite_club'

export function ClubProvider({ children }: { children: ReactNode }) {
    const [selectedClub, setSelectedClub] = useState<Club | null>(null)
    const [favoriteClub, setFavoriteClubState] = useState<Club | null>(null)
    const [clubs, setClubs] = useState<Club[]>([])

    const activeClub = selectedClub || favoriteClub

    const clubColor = useMemo(() => {
        if (!activeClub) return DEFAULT_COLOR
        if (activeClub.primary_color) return activeClub.primary_color
        return getPaletteColor(activeClub.id)
    }, [activeClub])

    // Set CSS custom property on document root when color changes
    useEffect(() => {
        document.documentElement.style.setProperty('--club-color', clubColor)
    }, [clubColor])

    const loadClubs = useCallback(async () => {
        if (clubs.length > 0) return
        const { data } = await supabase
            .from('clubs')
            .select('id, name, slug, search_name, logo_url, primary_color')
            .order('name')
        if (data) setClubs(data as Club[])
    }, [clubs.length])

    const getClubBySlug = useCallback(async (slug: string): Promise<Club | null> => {
        const cached = clubs.find(c => c.slug === slug)
        if (cached) return cached
        const { data } = await supabase
            .from('clubs')
            .select('id, name, slug, search_name, logo_url, primary_color')
            .eq('slug', slug)
            .single()
        if (data) {
            setClubs(prev => [...prev, data as Club])
            return data as Club
        }
        return null
    }, [clubs])

    const setFavoriteClub = useCallback((club: Club | null) => {
        setFavoriteClubState(club)
        if (club) {
            localStorage.setItem(FAVORITE_KEY, JSON.stringify(club))
        } else {
            localStorage.removeItem(FAVORITE_KEY)
        }
    }, [])

    useEffect(() => {
        try {
            const stored = localStorage.getItem(FAVORITE_KEY)
            if (stored) {
                const parsed = JSON.parse(stored) as Club
                setFavoriteClubState(parsed)
            }
        } catch { /* ignore */ }
    }, [])

    return (
        <ClubContext.Provider value={{
            selectedClub,
            setSelectedClub,
            favoriteClub,
            setFavoriteClub,
            clubs,
            loadClubs,
            getClubBySlug,
            clubColor,
        }}>
            {children}
        </ClubContext.Provider>
    )
}

export function useClub(): ClubContextType {
    const ctx = useContext(ClubContext)
    if (!ctx) throw new Error('useClub must be used within ClubProvider')
    return ctx
}

/** Shorthand for just the club color */
export function useClubColor(): string {
    const { clubColor } = useClub()
    return clubColor
}
