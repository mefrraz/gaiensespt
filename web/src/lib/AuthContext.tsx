import { useEffect, useState, type ReactNode } from 'react'
import { useUser, useAuth as useClerkAuth, useClerk } from '@clerk/clerk-react'
import { setClerkTokenProvider } from './supabase'

interface NormalizedUser {
    id: string
    email: string
    username: string | null
    firstName: string | null
    lastName: string | null
    imageUrl: string | null
    bio: string | null
}

interface AuthContextType {
    user: NormalizedUser | null
    loading: boolean
    signOut: () => Promise<void>
}

function normalizeUser(clerkUser: NonNullable<ReturnType<typeof useUser>['user']>): NormalizedUser {
    return {
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        username: clerkUser.username || null,
        firstName: clerkUser.firstName || null,
        lastName: clerkUser.lastName || null,
        imageUrl: clerkUser.imageUrl || null,
        bio: (clerkUser.unsafeMetadata?.bio as string) || null,
    }
}

/** Syncs Clerk session to Supabase token provider for RLS */
function TokenProviderSetup() {
    const { isLoaded, isSignedIn } = useUser()
    const { getToken } = useClerkAuth()
    const clerk = useClerk()
    const [oauthChecked, setOauthChecked] = useState(false)

    // Handle OAuth redirect
    useEffect(() => {
        if (isLoaded && !isSignedIn && !oauthChecked) {
            clerk
                .handleRedirectCallback({} as any)
                .then(() => {
                    setOauthChecked(true)
                })
                .catch(() => {
                    setOauthChecked(true)
                })
        }
    }, [isLoaded, isSignedIn, clerk, oauthChecked])

    // Sync Clerk session to Supabase token provider
    useEffect(() => {
        if (isLoaded) {
            if (isSignedIn) {
                setClerkTokenProvider(() => getToken({ template: 'supabase' }))
            } else {
                setClerkTokenProvider(null)
            }
        }
    }, [isLoaded, isSignedIn, getToken])

    return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
    return (
        <>
            <TokenProviderSetup />
            {children}
        </>
    )
}

export function useAuth(): AuthContextType {
    const { isLoaded, isSignedIn, user: clerkUser } = useUser()
    const clerk = useClerk()

    return {
        user: isSignedIn && clerkUser ? normalizeUser(clerkUser) : null,
        loading: !isLoaded,
        signOut: () => clerk.signOut(),
    }
}
