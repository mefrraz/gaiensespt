import { type ReactNode } from 'react'
import { useUser, useClerk } from '@clerk/clerk-react'

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

export function AuthProvider({ children }: { children: ReactNode }) {
    // ClerkProvider is in main.tsx — this wrapper exists so useAuth()
    // returns NormalizedUser instead of Clerk's UserResource
    return <>{children}</>
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
