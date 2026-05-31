import { useEffect, type ReactNode } from 'react'
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

    // Handle OAuth redirect callback — complete transferable verifications
    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            clerk
                .handleRedirectCallback({} as any)
                .catch(() => {
                    // Not a redirect callback — safe to ignore
                })
        }
    }, [isLoaded, isSignedIn, clerk])

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
            {/* Required by Clerk for bot protection / sign-up completion */}
            <div id="clerk-captcha" />
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
