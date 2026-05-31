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
            routerPush={(to) => {
                // Block redirects to our own domain (Clerk tries to redirect to sign-in page)
                if (to.startsWith('https://dribly.pt') || to.startsWith('/')) return
                // Allow OAuth redirects (google.com, etc.)
                window.location.href = to
            }}
            routerReplace={(to) => {
                if (to.startsWith('https://dribly.pt') || to.startsWith('/')) return
                window.location.href = to
            }}
        >
            <App />
        </ClerkProvider>
    </React.StrictMode>,
)
