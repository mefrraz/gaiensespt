import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { GameCard } from '../components/GameCard'
import { useClub } from '../lib/ClubContext'
import { type Match } from '../components/types'

const POPULAR_COMPETITIONS = [
    'Liga Betclic Masculina',
    'Campeonato da Proliga',
    'Campeonato Nacional da 1ª Divisão Masculina',
    'Liga Betclic Feminina',
    'Taça de Portugal Masculina Skoiy',
    'Taça de Portugal Feminina Skoiy',
]

function Landing() {
    const { favoriteClub } = useClub()
    const [games, setGames] = useState<Match[]>([])
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

    return (
        <div className="pb-24">
            {/* Hero Section — solid blue, no gradient */}
            <div className="bg-dribly-blue dark:bg-dribly-blue-dark">
                <div className="max-w-5xl mx-auto px-4 pt-12 md:pt-16 pb-10 md:pb-14 text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-[11px] font-bold uppercase tracking-wider mb-5 border border-white/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        Época 2025/2026
                    </div>

                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-3 leading-tight">
                        Basquetebol<br />Português ao Vivo
                    </h1>
                    <p className="text-sm md:text-base text-white/70 max-w-md mx-auto leading-relaxed mb-6">
                        Usa a barra de pesquisa no topo para encontrares o teu clube.
                    </p>

                    {/* Favorite shortcut */}
                    {favoriteClub && (
                        <Link
                            to={`/clube/${favoriteClub.slug}/home`}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-xs font-bold border border-white/10 hover:bg-white/20 transition-all group"
                        >
                            <HomeIcon size={14} />
                            <span>Continuar com {favoriteClub.name}</span>
                            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    )}
                </div>
            </div>

            {/* Stats Bar */}
            <div className="bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-white/5">
                <div className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-around md:justify-center md:gap-20">
                    <span className="text-xs text-zinc-500"><strong className="text-zinc-900 dark:text-white">197</strong> Clubes</span>
                    <span className="text-xs text-zinc-500"><strong className="text-zinc-900 dark:text-white">411</strong> Competições</span>
                    <span className="text-xs text-zinc-500"><strong className="text-zinc-900 dark:text-white">24</strong> Associações</span>
                </div>
            </div>

            {/* Jogos em Destaque — GameCard carousel, horizontal scroll */}
            <div className="py-8 bg-zinc-50/50 dark:bg-zinc-950/50">
                <div className="mb-4 px-4">
                    <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-dribly-blue animate-pulse" />
                        Jogos em Destaque
                    </h2>
                </div>

                {loading ? (
                    <div className="flex gap-3 overflow-hidden px-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="min-w-[280px] h-44 rounded-2xl bg-zinc-100 dark:bg-zinc-900 animate-pulse shrink-0" />
                        ))}
                    </div>
                ) : games.length === 0 ? (
                    <p className="text-xs text-zinc-400 text-center py-8">Nenhum jogo em destaque de momento.</p>
                ) : (
                    <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none">
                        {games.map(match => (
                            <div key={match.slug || match.id} className="min-w-[280px] shrink-0">
                                <GameCard match={match} mode="agenda" />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

function HomeIcon({ size, className }: { size: number; className?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    )
}

export default Landing
