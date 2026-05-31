import { useState } from 'react'
import { X, Mail, Lock, User, Loader2, CheckCircle, LogIn, LogOut } from 'lucide-react'
import { useSignIn, useSignUp, useUser, useClerk } from '@clerk/clerk-react'

interface AuthModalProps {
    isOpen: boolean
    onClose: () => void
    onAuthSuccess?: (method: 'signin' | 'signup') => void
}

export function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
    const { isSignedIn, user: clerkUser } = useUser()
    const clerk = useClerk()
    const { signIn, isLoaded: siLoaded, setActive } = useSignIn()
    const { signUp, isLoaded: suLoaded } = useSignUp()

    const [mode, setMode] = useState<'signin' | 'signup'>('signin')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
    const [errorMsg, setErrorMsg] = useState('')

    const isLoaded = siLoaded && suLoaded

    if (!isOpen) return null

    const reset = () => {
        setEmail('')
        setPassword('')
        setUsername('')
        setStatus('idle')
        setErrorMsg('')
    }

    const handleClose = () => {
        reset()
        onClose()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email.trim() || !password) return
        setStatus('loading')
        setErrorMsg('')

        try {
            if (mode === 'signup') {
                if (!username.trim()) {
                    setErrorMsg('Nome de utilizador obrigatório')
                    setStatus('error')
                    return
                }
                const result = await signUp!.create({
                    emailAddress: email.trim(),
                    password,
                    username: username.trim(),
                })
                if (result.status === 'complete') {
                    await setActive!({ session: result.createdSessionId! })
                    reset()
                    onClose()
                    onAuthSuccess?.('signup')
                } else {
                    // email verification pending — still considered success from UX perspective
                    setErrorMsg('Verifica o teu email para confirmares o registo.')
                    setStatus('error')
                }
            } else {
                const result = await signIn!.create({
                    identifier: email.trim(),
                    password,
                })
                if (result.status === 'complete') {
                    await setActive!({ session: result.createdSessionId! })
                    reset()
                    onClose()
                    onAuthSuccess?.('signin')
                } else {
                    setErrorMsg('Verificação adicional necessária.')
                    setStatus('error')
                }
            }
        } catch (err: any) {
            setStatus('error')
            // Normalize Clerk error messages to PT
            const msg = err?.errors?.[0]?.message || err?.message || ''
            if (msg.includes('identifier is invalid') || msg.includes('no user') || msg.includes('Invalid'))
                setErrorMsg('Email ou palavra-passe incorretos.')
            else if (msg.includes('password'))
                setErrorMsg('Palavra-passe demasiado fraca.')
            else if (msg.includes('username'))
                setErrorMsg('Este username já está em uso.')
            else if (msg.includes('email address'))
                setErrorMsg('Este email já está registado.')
            else
                setErrorMsg(msg || 'Ocorreu um erro. Tenta novamente.')
        }
    }

    const handleGoogle = async () => {
        if (!signIn) return
        setStatus('loading')
        try {
            await signIn.authenticateWithRedirect({
                strategy: 'oauth_google',
                redirectUrl: '/',
                redirectUrlComplete: '/',
            })
        } catch {
            setErrorMsg('Erro ao iniciar sessão com Google.')
            setStatus('error')
        }
    }

    const switchMode = () => {
        setMode(mode === 'signin' ? 'signup' : 'signin')
        setErrorMsg('')
        setStatus('idle')
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

            <div className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-white/10 p-6 animate-slide-up">
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
                    aria-label="Fechar"
                >
                    <X size={18} />
                </button>

                {isSignedIn && clerkUser ? (
                    <div className="text-center py-2">
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
                    <>
                        <div className="text-center mb-5">
                            <div className="w-14 h-14 mx-auto rounded-full bg-dribly-purple/10 flex items-center justify-center mb-3">
                                {mode === 'signin' ? (
                                    <LogIn size={24} className="text-dribly-purple" />
                                ) : (
                                    <User size={24} className="text-dribly-purple" />
                                )}
                            </div>
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">
                                {mode === 'signin' ? 'Iniciar sessão' : 'Criar conta'}
                            </h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                {mode === 'signin'
                                    ? 'Entra com a tua conta.'
                                    : 'Regista-te para seguir clubes e competições.'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            {/* Google button */}
                            <button
                                type="button"
                                onClick={handleGoogle}
                                disabled={!isLoaded || status === 'loading'}
                                className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-full border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-bold hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                Continuar com Google
                            </button>

                            {/* Divider */}
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-px bg-zinc-200 dark:bg-white/10" />
                                <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">ou</span>
                                <div className="flex-1 h-px bg-zinc-200 dark:bg-white/10" />
                            </div>

                            {/* Username — signup only */}
                            {mode === 'signup' && (
                                <div className="relative">
                                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        placeholder="Nome de utilizador"
                                        autoFocus
                                        required
                                        className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 outline-none transition-all focus:ring-2 focus:ring-dribly-purple/30 focus:border-dribly-purple"
                                    />
                                </div>
                            )}

                            {/* Email */}
                            <div className="relative">
                                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="Email"
                                    autoFocus={mode === 'signin'}
                                    required
                                    className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 outline-none transition-all focus:ring-2 focus:ring-dribly-purple/30 focus:border-dribly-purple"
                                />
                            </div>

                            {/* Password */}
                            <div className="relative">
                                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Palavra-passe"
                                    minLength={6}
                                    required
                                    className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 outline-none transition-all focus:ring-2 focus:ring-dribly-purple/30 focus:border-dribly-purple"
                                />
                            </div>

                            {/* Error */}
                            {status === 'error' && errorMsg && (
                                <p className="text-xs text-red-500 font-medium text-center">{errorMsg}</p>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={!isLoaded || status === 'loading'}
                                className="w-full py-2.5 rounded-full bg-dribly-purple text-white text-sm font-bold hover:bg-dribly-purple/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.97] shadow-sm shadow-dribly-purple/20 flex items-center justify-center gap-2"
                            >
                                {status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : null}
                                {mode === 'signin' ? 'Entrar' : 'Criar conta'}
                            </button>
                        </form>

                        {/* Mode switch */}
                        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 text-center mt-4">
                            {mode === 'signin' ? (
                                <>Não tens conta? <button onClick={switchMode} className="text-dribly-purple font-bold hover:underline">Criar conta</button></>
                            ) : (
                                <>Já tens conta? <button onClick={switchMode} className="text-dribly-purple font-bold hover:underline">Iniciar sessão</button></>
                            )}
                        </p>
                    </>
                )}
            </div>
        </div>
    )
}
