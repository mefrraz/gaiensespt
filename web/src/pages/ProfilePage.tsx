import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Mail, AtSign, FileText, Check, Loader2, LogOut } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'

export default function ProfilePage() {
    const { user, signOut } = useAuth()
    const navigate = useNavigate()

    const [firstName, setFirstName] = useState(
        (user?.user_metadata?.first_name as string) || ''
    )
    const [lastName, setLastName] = useState(
        (user?.user_metadata?.last_name as string) || ''
    )
    const [username, setUsername] = useState(
        (user?.user_metadata?.username as string) || ''
    )
    const [bio, setBio] = useState(
        (user?.user_metadata?.bio as string) || ''
    )
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    if (!user) {
        return (
            <div className="max-w-xl mx-auto px-3 py-16 text-center">
                <p className="text-sm text-zinc-500 mb-4">Inicia sessão para ver o perfil.</p>
                <Link to="/" className="text-xs font-bold text-dribly-purple hover:underline">Voltar ao início</Link>
            </div>
        )
    }

    const handleSave = async () => {
        setSaving(true)
        setSaved(false)
        const { error } = await user.update({
            data: {
                username: username || undefined,
                first_name: firstName || undefined,
                last_name: lastName || undefined,
                bio: bio || undefined,
                display_name: [firstName, lastName].filter(Boolean).join(' ') || username || undefined,
            }
        })
        setSaving(false)
        if (!error) {
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
        }
    }

    const displayName = [firstName, lastName].filter(Boolean).join(' ') || username || 'Utilizador'

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-[#09090b] dark:via-zinc-950 dark:to-[#09090b]">
            <div className="max-w-xl mx-auto px-3 sm:px-5 pt-6 pb-24">
                <button onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors mb-6 group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                    Voltar
                </button>

                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-full bg-dribly-purple text-white flex items-center justify-center text-xl font-bold shrink-0">
                        {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-xl font-bold text-zinc-900 dark:text-white truncate">{displayName}</h1>
                        <p className="text-sm text-zinc-500 truncate">{user.email}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                            <AtSign size={12} /> Username
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">@</span>
                            <input
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="teuusername"
                                className="w-full pl-8 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 outline-none transition-all focus:ring-2 focus:ring-dribly-purple/30 focus:border-dribly-purple"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                                <User size={12} /> Primeiro nome
                            </label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={e => setFirstName(e.target.value)}
                                placeholder="Primeiro"
                                className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 outline-none transition-all focus:ring-2 focus:ring-dribly-purple/30 focus:border-dribly-purple"
                            />
                        </div>
                        <div>
                            <label className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                                <User size={12} /> Último nome
                            </label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={e => setLastName(e.target.value)}
                                placeholder="Último"
                                className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 outline-none transition-all focus:ring-2 focus:ring-dribly-purple/30 focus:border-dribly-purple"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                            <FileText size={12} /> Bio
                        </label>
                        <textarea
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                            placeholder="Conta um pouco sobre ti..."
                            rows={3}
                            maxLength={200}
                            className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 outline-none transition-all focus:ring-2 focus:ring-dribly-purple/30 focus:border-dribly-purple resize-none"
                        />
                        <p className="text-[10px] text-zinc-400 mt-1 text-right">{bio.length}/200</p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full bg-dribly-purple text-white text-sm font-bold hover:bg-dribly-purple/90 disabled:opacity-50 transition-all active:scale-[0.97] shadow-sm shadow-dribly-purple/20"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : null}
                            {saved ? 'Guardado!' : 'Guardar'}
                        </button>

                        <button
                            onClick={async () => { await signOut(); navigate('/') }}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-sm font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-[0.97]"
                        >
                            <LogOut size={16} />
                            Sair
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
