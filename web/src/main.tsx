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
            signInUrl="/"
            signUpUrl="/"
            afterSignInUrl="/"
            afterSignUpUrl="/"
            routerPush={(to) => {
                // Prevent Clerk from navigating to hosted pages
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
