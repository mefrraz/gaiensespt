import { useState } from 'react'
import { X, Mail, Send, CheckCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'

interface AuthModalProps {
    isOpen: boolean
    onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const { user, signInWithEmail, signOut } = useAuth()
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
    const [errorMsg, setErrorMsg] = useState('')

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email.trim()) return
        setStatus('loading')
        setErrorMsg('')
        const { error } = await signInWithEmail(email.trim())
        if (error) {
            setStatus('error')
            setErrorMsg(error)
        } else {
            setStatus('sent')
        }
    }

    const handleSignOut = async () => {
        await signOut()
        setEmail('')
        setStatus('idle')
    }

    const handleClose = () => {
        setEmail('')
        setStatus('idle')
        setErrorMsg('')
        onClose()
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

            {/* Modal */}
            <div className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-white/10 p-6 animate-slide-up">
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
                >
                    <X size={18} />
                </button>

                {user ? (
                    /* Logged in */
                    <div className="text-center py-2">
                        <div className="w-14 h-14 mx-auto rounded-full bg-dribly-purple/10 flex items-center justify-center mb-3">
                            <CheckCircle size={28} className="text-dribly-purple" />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">Sessão iniciada</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5 break-all">{user.email}</p>
                        <button
                            onClick={handleSignOut}
                            className="w-full py-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-[0.97]"
                        >
                            Terminar sessão
                        </button>
                    </div>
                ) : status === 'sent' ? (
                    /* Magic link sent */
                    <div className="text-center py-4">
                        <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
                            <Send size={24} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">Email enviado!</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                            Verifica o teu email <strong>{email}</strong>
                        </p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-5">
                            Clica no link que recebeste para iniciar sessão. Podes fechar esta janela.
                        </p>
                        <button
                            onClick={handleClose}
                            className="w-full py-2.5 rounded-full bg-dribly-purple text-white text-sm font-bold hover:bg-dribly-purple/90 transition-all active:scale-[0.97] shadow-sm shadow-dribly-purple/20"
                        >
                            Fechar
                        </button>
                    </div>
                ) : (
                    /* Login form */
                    <>
                        <div className="text-center mb-5">
                            <div className="w-14 h-14 mx-auto rounded-full bg-dribly-purple/10 flex items-center justify-center mb-3">
                                <Mail size={24} className="text-dribly-purple" />
                            </div>
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">Iniciar sessão</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                Insere o teu email para receber um link mágico de acesso.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setStatus('idle'); setErrorMsg('') }}
                                placeholder="teu@email.com"
                                autoFocus
                                required
                                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 outline-none transition-all focus:ring-2 focus:ring-dribly-purple/30 focus:border-dribly-purple"
                            />

                            {status === 'error' && (
                                <p className="text-xs text-red-500 font-medium">{errorMsg}</p>
                            )}

                            <button
                                type="submit"
                                disabled={status === 'loading' || !email.trim()}
                                className="w-full py-2.5 rounded-full bg-dribly-purple text-white text-sm font-bold hover:bg-dribly-purple/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.97] shadow-sm shadow-dribly-purple/20 flex items-center justify-center gap-2"
                            >
                                {status === 'loading' ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Send size={16} />
                                )}
                                Enviar link mágico
                            </button>
                        </form>

                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 text-center mt-4 leading-relaxed">
                            Sem palavras-passe. Clicas no link que recebes no email e ficas automaticamente com sessão iniciada.
                        </p>
                    </>
                )}
            </div>
        </div>
    )
}
