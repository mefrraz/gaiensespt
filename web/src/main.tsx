import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.tsx'
import './index.css'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!clerkPubKey) {
    console.error("Missing VITE_CLERK_PUBLISHABLE_KEY — Clerk auth will not work")
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ClerkProvider
            publishableKey={clerkPubKey || ''}
            signInUrl={window.location.origin + '/'}
            signUpUrl={window.location.origin + '/'}
            afterSignInUrl={window.location.origin + '/'}
            afterSignUpUrl={window.location.origin + '/'}
            routerPush={(to) => {
                if (to.includes('accounts.dribly.pt')) return
                window.location.href = to
            }}
            routerReplace={(to) => {
                if (to.includes('accounts.dribly.pt')) return
                window.location.href = to
            }}
        >
            <App />
        </ClerkProvider>
    </React.StrictMode>,
)
