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

    const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'sent'>('idle')
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
                const result = await Promise.race([
                    signUp!.create({
                        emailAddress: email.trim(),
                        password,
                        username: username.trim(),
                    }),
                    new Promise<never>((_, reject) =>
                        setTimeout(() => reject(new Error('timeout')), 15000)
                    ),
                ])
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
                const result = await Promise.race([
                    signIn!.create({
                        identifier: email.trim(),
                        password,
                    }),
                    new Promise<never>((_, reject) =>
                        setTimeout(() => reject(new Error('timeout')), 15000)
                    ),
                ])
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
            else if (msg.includes('timeout'))
                setErrorMsg('O pedido demorou demasiado. Verifica a tua ligação e tenta novamente.')
            else if (msg.includes('email address'))
                setErrorMsg('Este email já está registado.')
            else
                setErrorMsg(msg || 'Ocorreu um erro. Tenta novamente.')
        }
    }

    const switchMode = () => {
        if (mode === 'forgot') {
            setMode('signin')
        } else {
            setMode(mode === 'signin' ? 'signup' : 'signin')
        }
        setErrorMsg('')
        setStatus('idle')
    }

    const handleForgotPassword = async () => {
        if (!email.trim() || !signIn) return
        setStatus('loading')
        try {
            await signIn.create({
                identifier: email.trim(),
                strategy: 'reset_password_email_code',
            })
            setStatus('sent')
        } catch (err: any) {
            setStatus('error')
            setErrorMsg('Email não encontrado. Verifica se está correto.')
        }
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
                                {mode === 'forgot' ? 'Recuperar palavra-passe' : mode === 'signin' ? 'Iniciar sessão' : 'Criar conta'}
                            </h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                {mode === 'forgot'
                                    ? 'Receberás um email para redefinir a palavra-passe.'
                                    : mode === 'signin'
                                        ? 'Entra com a tua conta.'
                                        : 'Regista-te para seguir clubes e competições.'}
                            </p>
                        </div>

                        {mode === 'forgot' ? (
                            /* Forgot password mode */
                            <div className="space-y-3">
                                {status === 'sent' ? (
                                    <div className="text-center py-2">
                                        <CheckCircle size={28} className="text-green-500 mx-auto mb-2" />
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                            Email enviado! Verifica a tua caixa de entrada para redefinir a palavra-passe.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="relative">
                                            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                placeholder="Email"
                                                autoFocus
                                                required
                                                className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 outline-none transition-all focus:ring-2 focus:ring-dribly-purple/30 focus:border-dribly-purple"
                                            />
                                        </div>

                                        {status === 'error' && errorMsg && (
                                            <p className="text-xs text-red-500 font-medium text-center">{errorMsg}</p>
                                        )}

                                        <button
                                            type="button"
                                            onClick={handleForgotPassword}
                                            disabled={!isLoaded || status === 'loading'}
                                            className="w-full py-2.5 rounded-full bg-dribly-purple text-white text-sm font-bold hover:bg-dribly-purple/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.97] flex items-center justify-center gap-2"
                                        >
                                            {status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : null}
                                            Enviar email
                                        </button>
                                    </>
                                )}
                            </div>
                        ) : (
                        <form onSubmit={handleSubmit} className="space-y-3">
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

                            {/* Forgot password link — sign in only */}
                            {mode === 'signin' && (
                                <p className="text-right">
                                    <button
                                        type="button"
                                        onClick={() => { setMode('forgot'); setErrorMsg(''); setStatus('idle') }}
                                        className="text-[11px] text-zinc-400 hover:text-dribly-purple transition-colors"
                                    >
                                        Esqueci a palavra-passe?
                                    </button>
                                </p>
                            )}

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
                        )}

                        {/* Mode switch */}
                        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 text-center mt-4">
                            {mode === 'forgot' ? (
                                <>Lembraste-te? <button onClick={switchMode} className="text-dribly-purple font-bold hover:underline">Iniciar sessão</button></>
                            ) : mode === 'signin' ? (
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
