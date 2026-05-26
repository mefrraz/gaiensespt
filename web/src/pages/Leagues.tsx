import { Link } from 'react-router-dom'
import { Trophy, Heart } from 'lucide-react'
import { useFollows } from '../hooks/useFollows'
import { useAuth } from '../lib/AuthContext'

const POPULAR_LEAGUES = [
    { id: 10902, name: 'Liga Betclic Masculina', desc: 'Primeira liga nacional masculina' },
    { id: 10906, name: 'Liga Betclic Feminina', desc: 'Primeira liga nacional feminina' },
    { id: 10903, name: 'Proliga', desc: 'Segunda divisão nacional masculina' },
    { id: 10907, name: '1ª Divisão Feminina', desc: 'Segunda divisão nacional feminina' },
    { id: 10904, name: '1ª Divisão Masculina', desc: 'Terceira divisão nacional masculina' },
]

const CUP_LEAGUES = [
    { id: 10917, name: 'Taça Hugo dos Santos', desc: 'Taça nacional masculina' },
    { id: 10920, name: 'Supertaça Feminina', desc: 'Supertaça feminina' },
]

export default function Leagues() {
    const { user } = useAuth()
    const { isFollowing, toggleFollow } = useFollows()

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-[#09090b] dark:via-zinc-950 dark:to-[#09090b]">
            <div className="max-w-4xl mx-auto px-3 sm:px-5 pt-6 sm:pt-8 pb-16">
                <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight mb-2 text-center">Ligas</h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mb-8 max-w-md mx-auto">
                    As principais competições da Federação Portuguesa de Basquetebol
                </p>

                {/* Popular leagues */}
                <div className="mb-8">
                    <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Trophy size={14} className="text-dribly-purple" />
                        Ligas Populares
                    </h2>
                    <div className="space-y-2.5">
                        {POPULAR_LEAGUES.map(league => (
                            <LeagueRow
                                key={league.id}
                                id={league.id}
                                name={league.name}
                                desc={league.desc}
                                isFollowed={user ? isFollowing('competition', league.id) : false}
                                showFollow={!!user}
                                onToggleFollow={() => toggleFollow('competition', league.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Cups */}
                <div className="mb-8">
                    <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Trophy size={14} className="text-dribly-purple" />
                        Taças
                    </h2>
                    <div className="space-y-2.5">
                        {CUP_LEAGUES.map(league => (
                            <LeagueRow
                                key={league.id}
                                id={league.id}
                                name={league.name}
                                desc={league.desc}
                                isFollowed={user ? isFollowing('competition', league.id) : false}
                                showFollow={!!user}
                                onToggleFollow={() => toggleFollow('competition', league.id)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

function LeagueRow({ id, name, desc, isFollowed, showFollow, onToggleFollow }: {
    id: number
    name: string
    desc: string
    isFollowed: boolean
    showFollow: boolean
    onToggleFollow: () => void
}) {
    return (
        <div className="group flex items-center gap-3 bg-white dark:bg-zinc-900/90 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-4 hover:border-dribly-purple/40 dark:hover:border-dribly-purple/40 hover:shadow-md transition-all duration-200">
            <Link to={`/competicao/${id}`} className="flex-1 min-w-0 flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-dribly-purple/15 to-dribly-purple/5 flex items-center justify-center shrink-0 border border-dribly-purple/10">
                    <Trophy size={20} className="text-dribly-purple" />
                </div>
                <div className="min-w-0">
                    <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-dribly-purple dark:group-hover:text-dribly-purple transition-colors">{name}</h3>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{desc}</p>
                </div>
                <svg className="w-4 h-4 shrink-0 text-zinc-300 group-hover:text-dribly-purple transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
            </Link>
            {showFollow && (
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleFollow() }}
                    className={`p-2 rounded-full transition-all active:scale-[0.9] ${
                        isFollowed
                            ? 'text-dribly-purple bg-dribly-purple/10 hover:bg-dribly-purple/20'
                            : 'text-zinc-400 hover:text-dribly-purple hover:bg-dribly-purple/5'
                    }`}
                    title={isFollowed ? 'Deixar de seguir' : 'Seguir'}
                >
                    <Heart size={16} strokeWidth={isFollowed ? 2.5 : 2} fill={isFollowed ? 'currentColor' : 'none'} />
                </button>
            )}
        </div>
    )
}
