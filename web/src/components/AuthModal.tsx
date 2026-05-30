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
    const [isDark, setIsDark] = useState(true)

    useEffect(() => {
        const update = () => setIsDark(document.documentElement.classList.contains('dark'))
        update()
        const obs = new MutationObserver(update)
        obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
        return () => obs.disconnect()
    }, [])

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

    // Minimal appearance — just match our purple, let Clerk's card shine
    const clerkAppearance = {
        baseTheme: isDark ? dark : undefined,
        variables: {
            colorPrimary: '#a855f7',
            borderRadius: '0.75rem',
        },
        elements: {
            footerAction: { display: 'none' },
        },
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

            {isSignedIn && clerkUser ? (
                /* Signed-in: keep our custom card */
                <div className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-white/10 p-6 animate-slide-up">
                    <button onClick={handleClose}
                        className="absolute top-4 right-4 p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors">
                        <X size={18} />
                    </button>
                    <div className="text-center py-2">
                        <div className="w-14 h-14 mx-auto rounded-full bg-dribly-purple/10 flex items-center justify-center mb-3">
                            <CheckCircle size={28} className="text-dribly-purple" />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">Sessão iniciada</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5 break-all">
                            {clerkUser.primaryEmailAddress?.emailAddress}
                        </p>
                        <button onClick={() => { clerk.signOut(); handleClose() }}
                            className="w-full py-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-[0.97] flex items-center justify-center gap-2">
                            <LogOut size={16} />
                            Terminar sessão
                        </button>
                    </div>
                </div>
            ) : (
                /* Clerk's own native card — no wrapper, no double-styling */
                <div className="relative animate-slide-up max-w-md w-full">
                    {/* Close button — floats on top-right corner of Clerk card */}
                    <button
                        onClick={handleClose}
                        className="absolute -top-3 -right-3 z-10 p-2 rounded-full bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 shadow-lg border border-zinc-200 dark:border-white/10 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                        aria-label="Fechar"
                    >
                        <X size={16} />
                    </button>

                    {mode === 'signin' ? (
                        <SignIn routing="virtual" signUpUrl="#" appearance={clerkAppearance} />
                    ) : (
                        <SignUp routing="virtual" signInUrl="#" appearance={clerkAppearance} />
                    )}

                    {/* Mode switcher below Clerk's card */}
                    <p className="text-[12px] text-zinc-300 dark:text-zinc-400 text-center mt-3">
                        {mode === 'signin' ? (
                            <>Não tens conta? <button onClick={switchMode} className="text-dribly-purple font-bold hover:underline">Criar conta</button></>
                        ) : (
                            <>Já tens conta? <button onClick={switchMode} className="text-dribly-purple font-bold hover:underline">Iniciar sessão</button></>
                        )}
                    </p>
                </div>
            )}
        </div>
    )
}
