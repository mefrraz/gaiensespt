import { useState, useEffect } from 'react'
import { X, CheckCircle, LogOut } from 'lucide-react'
import { SignIn, SignUp, useUser, useClerk } from '@clerk/clerk-react'
import { dark } from '@clerk/themes'

interface AuthModalProps {
    isOpen: boolean
    onClose: () => void
    onAuthSuccess?: (method: 'signin' | 'signup') => void
}

export function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
    const { isSignedIn, isLoaded, user: clerkUser } = useUser()
    const clerk = useClerk()
    const [mode, setMode] = useState<'signin' | 'signup'>('signin')
    const [isDark, setIsDark] = useState(true) // assume dark until verified

    // Reactively track dark mode
    useEffect(() => {
        const update = () => setIsDark(document.documentElement.classList.contains('dark'))
        update()
        const obs = new MutationObserver(update)
        obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
        return () => obs.disconnect()
    }, [])

    // Close modal when Clerk auth completes
    useEffect(() => {
        if (isSignedIn && clerkUser && isLoaded && isOpen) {
            const timer = setTimeout(() => {
                onAuthSuccess?.(mode)
                onClose()
            }, 400)
            return () => clearTimeout(timer)
        }
    }, [isSignedIn, clerkUser, isLoaded, isOpen, onAuthSuccess, onClose, mode])

    const switchMode = () => setMode(mode === 'signin' ? 'signup' : 'signin')

    const handleClose = () => {
        setMode('signin')
        onClose()
    }

    if (!isOpen) return null

    // Clerk appearance — clean integration with Dribly theme
    const clerkAppearance = {
        baseTheme: isDark ? dark : undefined,
        variables: {
            colorPrimary: '#a855f7',
            colorBackground: isDark ? '#18181b' : '#ffffff',
            colorInputBackground: isDark ? '#27272a' : '#f4f4f5',
            colorInputText: isDark ? '#fafafa' : '#18181b',
            colorText: isDark ? '#fafafa' : '#18181b',
            colorTextSecondary: isDark ? '#a1a1aa' : '#71717a',
            colorDanger: '#ef4444',
            borderRadius: '0.75rem',
        },
        elements: {
            card: {
                boxShadow: 'none',
                border: 'none',
                width: '100%',
                padding: '0',
                backgroundColor: 'transparent',
            },
            headerTitle: { display: 'none' },
            headerSubtitle: { display: 'none' },
            dividerLine: {
                backgroundColor: isDark ? '#27272a' : '#e4e4e7',
            },
            dividerText: {
                color: isDark ? '#71717a' : '#a1a1aa',
            },
            socialButtonsBlockButton: {
                borderRadius: '9999px',
                border: `1px solid ${isDark ? '#3f3f46' : '#e4e4e7'}`,
                backgroundColor: isDark ? '#27272a' : '#ffffff',
                color: isDark ? '#fafafa' : '#18181b',
                fontWeight: 600,
            },
            formFieldInput: {
                borderRadius: '0.75rem',
                backgroundColor: isDark ? '#27272a' : '#f4f4f5',
                border: `1px solid ${isDark ? '#3f3f46' : '#e4e4e7'}`,
            },
            formFieldLabel: {
                fontWeight: 600,
                color: isDark ? '#a1a1aa' : '#71717a',
            },
            formButtonPrimary: {
                borderRadius: '9999px',
                backgroundColor: '#a855f7',
                fontWeight: 700,
                border: 'none',
            },
            footerAction: { display: 'none' },
            identityPreviewEditButton: { color: '#a855f7' },
        },
    }

    const icon = mode === 'signin'
        ? (<><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></>)
        : (<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>)

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
            <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-white/10 animate-slide-up overflow-hidden">
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-10 p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
                    aria-label="Fechar"
                >
                    <X size={18} />
                </button>

                {isSignedIn && clerkUser ? (
                    /* Signed-in state */
                    <div className="px-6 py-8 text-center">
                        <div className="w-14 h-14 mx-auto rounded-full bg-dribly-purple/10 flex items-center justify-center mb-3">
                            <CheckCircle size={28} className="text-dribly-purple" />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">Sessão iniciada</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5 break-all">
                            {clerkUser.primaryEmailAddress?.emailAddress}
                        </p>
                        <button
                            onClick={() => { clerk.signOut(); handleClose() }}
                            className="w-full py-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-[0.97] flex items-center justify-center gap-2"
                        >
                            <LogOut size={16} />
                            Terminar sessão
                        </button>
                    </div>
                ) : (
                    /* Auth form */
                    <div className="px-5 pt-6 pb-5">
                        {/* Header */}
                        <div className="text-center mb-3">
                            <div className="w-12 h-12 mx-auto rounded-full bg-dribly-purple/10 flex items-center justify-center mb-2">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    {icon}
                                </svg>
                            </div>
                            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                                {mode === 'signin' ? 'Iniciar sessão' : 'Criar conta'}
                            </h3>
                        </div>

                        {/* Clerk component — takes full width, transparent background */}
                        <div className="clerk-inner">
                            {mode === 'signin' ? (
                                <SignIn routing="virtual" signUpUrl="#" appearance={clerkAppearance} />
                            ) : (
                                <SignUp routing="virtual" signInUrl="#" appearance={clerkAppearance} />
                            )}
                        </div>

                        {/* Mode switcher */}
                        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 text-center mt-3">
                            {mode === 'signin' ? (
                                <>Não tens conta? <button onClick={switchMode} className="text-dribly-purple font-bold hover:underline">Criar conta</button></>
                            ) : (
                                <>Já tens conta? <button onClick={switchMode} className="text-dribly-purple font-bold hover:underline">Iniciar sessão</button></>
                            )}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
