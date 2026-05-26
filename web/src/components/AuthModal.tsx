import { useState } from 'react'
import { X, Mail, Lock, User, Loader2, CheckCircle, LogIn } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'

interface AuthModalProps {
    isOpen: boolean
    onClose: () => void
    onAuthSuccess?: (method: 'signin' | 'signup') => void
}

export function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
    const { user, signUp, signIn, signOut } = useAuth()
    const [mode, setMode] = useState<'signin' | 'signup'>('signin')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
    const [errorMsg, setErrorMsg] = useState('')

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

        let result: { error: string | null }
        if (mode === 'signup') {
            if (!username.trim()) { setErrorMsg('Nome de utilizador obrigatório'); setStatus('error'); return }
            result = await signUp(email.trim(), password, username.trim())
        } else {
            result = await signIn(email.trim(), password)
        }

        if (result.error) {
            setStatus('error')
            setErrorMsg(result.error)
        } else {
            reset()
            onClose()
            onAuthSuccess?.(mode)
        }
    }

    const handleSignOut = async () => {
        await signOut()
        reset()
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
                <button onClick={handleClose}
                    className="absolute top-4 right-4 p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors">
                    <X size={18} />
                </button>

                {user ? (
                    <div className="text-center py-2">
                        <div className="w-14 h-14 mx-auto rounded-full bg-dribly-purple/10 flex items-center justify-center mb-3">
                            <CheckCircle size={28} className="text-dribly-purple" />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">Sessão iniciada</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5 break-all">{user.email}</p>
                        <button onClick={handleSignOut}
                            className="w-full py-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-[0.97]">
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
                                    ? 'Entra com o teu email e palavra-passe.'
                                    : 'Regista-te para seguir clubes e competições.'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            {mode === 'signup' && (
                                <div className="relative">
                                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Nome de utilizador"
                                        autoFocus
                                        required
                                        className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 outline-none transition-all focus:ring-2 focus:ring-dribly-purple/30 focus:border-dribly-purple"
                                    />
                                </div>
                            )}
                            <div className="relative">
                                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email"
                                    autoFocus={mode === 'signin'}
                                    required
                                    className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 outline-none transition-all focus:ring-2 focus:ring-dribly-purple/30 focus:border-dribly-purple"
                                />
                            </div>
                            <div className="relative">
                                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Palavra-passe"
                                    minLength={6}
                                    required
                                    className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 outline-none transition-all focus:ring-2 focus:ring-dribly-purple/30 focus:border-dribly-purple"
                                />
                            </div>

                            {status === 'error' && (
                                <p className="text-xs text-red-500 font-medium">{errorMsg}</p>
                            )}

                            <button type="submit" disabled={status === 'loading'}
                                className="w-full py-2.5 rounded-full bg-dribly-purple text-white text-sm font-bold hover:bg-dribly-purple/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.97] shadow-sm shadow-dribly-purple/20 flex items-center justify-center gap-2">
                                {status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : null}
                                {mode === 'signin' ? 'Entrar' : 'Criar conta'}
                            </button>
                        </form>

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
