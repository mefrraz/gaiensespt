import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Match } from './types'
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react'

const POPULAR_COMPETITIONS = [
    'Liga Betclic Masculina',
    'Campeonato da Proliga',
    'Campeonato Nacional da 1ª Divisão Masculina',
    'Liga Betclic Feminina',
    'Taça de Portugal Masculina Skoiy',
    'Taça de Portugal Feminina Skoiy',
]

function formatDate(dateStr: string) {
    const date = new Date(dateStr)
    const formatted = date.toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric', month: 'short' })
    return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export function GameCarousel() {
    const [games, setGames] = useState<Match[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase
            .from('games_2025_2026')
            .select('*')
            .in('competicao', POPULAR_COMPETITIONS)
            .neq('status', 'FINALIZADO')
            .gte('data', new Date().toISOString().split('T')[0])
            .order('data', { ascending: true })
            .limit(20)
            .then(({ data }) => {
                if (data && data.length > 0) {
                    setGames(data as Match[])
                }
                setLoading(false)
            })
    }, [])

    const next = () => setCurrentIndex(i => Math.min(i + 1, games.length - 4))
    const prev = () => setCurrentIndex(i => Math.max(i - 1, 0))

    if (loading) {
        return (
            <div className="flex gap-3 overflow-hidden px-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="min-w-[260px] h-44 rounded-2xl bg-zinc-100 dark:bg-zinc-900 animate-pulse shrink-0" />
                ))}
            </div>
        )
    }

    if (games.length === 0) return null

    return (
        <div className="relative">
            <div className="flex items-center justify-between px-4 mb-3">
                <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-dribly-blue animate-pulse" />
                    Jogos em Destaque
                </h2>
                {games.length > 4 && (
                    <div className="flex gap-1">
                        <button onClick={prev} disabled={currentIndex === 0}
                            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 disabled:opacity-30 transition-colors">
                            <ChevronLeft size={16} />
                        </button>
                        <button onClick={next} disabled={currentIndex >= games.length - 4}
                            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 disabled:opacity-30 transition-colors">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>

            <div className="flex gap-3 overflow-hidden px-4">
                <div
                    className="flex gap-3 transition-transform duration-300 ease-out"
                    style={{ transform: `translateX(-${currentIndex * 268}px)` }}
                >
                    {games.map((game, i) => (
                        <Link
                            key={game.slug || i}
                            to={`/game/${game.slug || ''}`}
                            className="min-w-[260px] glass-card p-4 flex flex-col gap-3 shrink-0 hover:border-dribly-blue/30 group"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-dribly-blue uppercase tracking-wide truncate max-w-[160px]">{game.competicao}</span>
                                {game.hora && game.hora.replace(/[^0-9]/g, '').length > 0 && (
                                    <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-1 shrink-0">
                                        <Clock size={10} />
                                        {game.hora.slice(0, 5)}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex-1 flex items-center gap-2 min-w-0">
                                    {game.logotipo_casa ? (
                                        <img src={game.logotipo_casa} alt="" className="w-8 h-8 object-contain rounded-full bg-zinc-50 dark:bg-zinc-800 shrink-0" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-white/10 flex items-center justify-center shrink-0">
                                            <span className="text-[10px] font-bold text-zinc-500">{game.equipa_casa?.charAt(0) || '?'}</span>
                                        </div>
                                    )}
                                    <p className="text-xs font-bold text-zinc-900 dark:text-white leading-tight line-clamp-1">{game.equipa_casa}</p>
                                </div>
                                <span className="text-[10px] font-black text-zinc-400 shrink-0">VS</span>
                                <div className="flex-1 flex items-center gap-2 min-w-0 justify-end">
                                    <p className="text-xs font-bold text-zinc-900 dark:text-white leading-tight line-clamp-1 text-right">{game.equipa_fora}</p>
                                    {game.logotipo_fora ? (
                                        <img src={game.logotipo_fora} alt="" className="w-8 h-8 object-contain rounded-full bg-zinc-50 dark:bg-zinc-800 shrink-0" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-white/10 flex items-center justify-center shrink-0">
                                            <span className="text-[10px] font-bold text-zinc-500">{game.equipa_fora?.charAt(0) || '?'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-2">
                                <span className="text-[10px] text-zinc-500 capitalize">{formatDate(game.data)}</span>
                                {game.local && (
                                    <>
                                        <span className="text-zinc-300">·</span>
                                        <span className="text-[10px] text-zinc-400 truncate max-w-[100px]">{game.local}</span>
                                    </>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
