import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from './supabase'

interface ClubData {
    clubId: number | null
    clubName: string
    clubSlug: string
    logoUrl: string | null
    loading: boolean
}

const ClubContext = createContext<ClubData>({
    clubId: null, clubName: '', clubSlug: '', logoUrl: null, loading: true
})

export function useClub() {
    return useContext(ClubContext)
}

export function ClubProvider({ children }: { children: ReactNode }) {
    const { clubSlug } = useParams<{ clubSlug?: string }>()
    const [data, setData] = useState<ClubData>({
        clubId: null, clubName: '', clubSlug: clubSlug || '', logoUrl: null, loading: true
    })

    useEffect(() => {
        if (!clubSlug) {
            setData({ clubId: null, clubName: '', clubSlug: '', logoUrl: null, loading: false })
            return
        }

        setData(prev => ({ ...prev, loading: true }))
        supabase.from('clubs').select('*').eq('slug', clubSlug).single()
            .then(({ data: club }) => {
                if (club) {
                    setData({
                        clubId: club.id as number,
                        clubName: club.name as string,
                        clubSlug: club.slug as string,
                        logoUrl: club.logo_url as string || null,
                        loading: false,
                    })
                } else {
                    setData(prev => ({ ...prev, loading: false }))
                }
            })
    }, [clubSlug])

    return <ClubContext.Provider value={data}>{children}</ClubContext.Provider>
}
