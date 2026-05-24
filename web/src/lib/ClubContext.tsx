import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { supabase } from './supabase'

export interface Club {
    id: number
    name: string
    slug: string
    search_name: string
    logo_url: string | null
    logo_secondary: string | null
    primary_color: string | null
    priority: number | null
}

interface ClubContextType {
    selectedClub: Club | null
    setSelectedClub: (club: Club | null) => void
    favoriteClub: Club | null
    setFavoriteClub: (club: Club | null) => void
    clubs: Club[]
    loadClubs: () => Promise<void>
    getClubBySlug: (slug: string) => Promise<Club | null>
}

const ClubContext = createContext<ClubContextType | null>(null)

const FAVORITE_KEY = 'dribly_favorite_club'

export function ClubProvider({ children }: { children: ReactNode }) {
    const [selectedClub, setSelectedClub] = useState<Club | null>(null)
    const [favoriteClub, setFavoriteClubState] = useState<Club | null>(null)
    const [clubs, setClubs] = useState<Club[]>([])

    const loadClubs = useCallback(async () => {
        if (clubs.length > 0) return
        const { data } = await supabase
            .from('clubs')
            .select('id, name, slug, search_name, logo_url, logo_secondary, primary_color, priority')
            .order('name')
        if (data) setClubs(data as Club[])
    }, [clubs.length])

    const getClubBySlug = useCallback(async (slug: string): Promise<Club | null> => {
        const cached = clubs.find(c => c.slug === slug)
        if (cached) return cached
        const { data } = await supabase
            .from('clubs')
            .select('id, name, slug, search_name, logo_url, logo_secondary, primary_color, priority')
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
