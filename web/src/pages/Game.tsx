import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, MapPin, Share2, Trophy, Navigation, TrendingUp, TrendingDown, ExternalLink, Clock } from 'lucide-react'
import { SkeletonHero } from '../components/Skeleton'
import { Match } from '../components/types'

function Game() {
    const { slug } = useParams()
    const [match, setMatch] = useState<Match | null>(null)
    const [recentGames, setRecentGames] = useState<Match[]>([])
    const [upcomingH2H, setUpcomingH2H] = useState<Match[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!slug) return
        setLoading(true)
        supabase
            .from('games_2025_2026')
            .select('*')
            .eq('slug', slug)
            .single()
            .then(({ data, error }) => {
                if (!error && data) setMatch(data as Match)
                setLoading(false)
            })
    }, [slug])

    useEffect(() => {
        if (!match) return
        const home = match.equipa_casa
        const away = match.equipa_fora
        const seasons = ['2025_2026', '2024_2025', '2023_2024', '2022_2023']
        Promise.all(
            seasons.map(s =>
                supabase
                    .from(`games_${s}`)
                    .select('*')
                    .eq('escalao', match.escalao)
                    .neq('slug', slug)
                    .eq('status', 'FINALIZADO')
                    .order('data', { ascending: false })
                    .then(({ data }) => (data || []) as Match[])
            )
        ).then(results => {
            const all = results.flat()
            // Deduplicate: same slug appears in multiple season tables
            const unique = Array.from(new Map(all.map(g => [g.slug, g])).values())
            const h2h = unique
                .filter(g =>
                    (g.equipa_casa.toUpperCase().includes(home.toUpperCase()) && g.equipa_fora.toUpperCase().includes(away.toUpperCase())) ||
                    (g.equipa_casa.toUpperCase().includes(away.toUpperCase()) && g.equipa_fora.toUpperCase().includes(home.toUpperCase()))
                )
                .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                .slice(0, 5)
            setRecentGames(h2h)
        })
    }, [match, slug])

    useEffect(() => {
        if (!match) return
        const home = match.equipa_casa
        const away = match.equipa_fora
        supabase
            .from('games_2025_2026')
            .select('*')
            .neq('slug', slug)
            .eq('status', 'AGENDADO')
            .gte('data', new Date().toISOString().split('T')[0])
            .order('data', { ascending: true })
            .limit(10)
            .then(({ data }) => {
                if (!data) return
                const future = (data as Match[]).filter(g =>
                    (g.equipa_casa.toUpperCase().includes(home.toUpperCase()) && g.equipa_fora.toUpperCase().includes(away.toUpperCase())) ||
                    (g.equipa_casa.toUpperCase().includes(away.toUpperCase()) && g.equipa_fora.toUpperCase().includes(home.toUpperCase()))
                ).slice(0, 3)
                setUpcomingH2H(future)
            })
    }, [match, slug])

    const shareGame = () => {
        if (!match) return
        if (navigator.share) {
            navigator.share({
                title: `FC Gaia vs ${match.equipa_fora}`,
                text: `${match.equipa_casa} vs ${match.equipa_fora} — ${match.resultado_casa ?? '?'} : ${match.resultado_fora ?? '?'}`,
                url: window.location.href
            })
        } else {
            navigator.clipboard.writeText(window.location.href)
        }
    }

    if (loading) {
        return (
            <div className="max-w-xl mx-auto pb-24 px-3">
                <div className="flex items-center justify-between pt-3 mb-4">
                    <div className="h-10 w-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
                    <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                    <div className="h-10 w-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
                </div>
                <SkeletonHero />
            </div>
        )
    }

    if (!match) {
        return (
            <div className="max-w-xl mx-auto px-3 py-32 text-center">
                <Trophy size={40} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-4" strokeWidth={1} />
                <p className="text-sm text-zinc-500 mb-4">Jogo não encontrado</p>
                <button onClick={() => window.history.back()} className="text-xs font-bold text-gaia-yellow hover:underline">Voltar</button>
            </div>
        )
    }

    const dateFormatted = new Date(match.data).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    const isFinished = match.status === 'FINALIZADO'
    const isLive = match.status === 'A DECORRER'
    const gaiaScore = match.resultado_casa !== null && match.resultado_fora !== null
    const isGaiaWin = gaiaScore && (
        (match.equipa_casa.toUpperCase().includes('GAIA') && match.resultado_casa! > match.resultado_fora!) ||
        (match.equipa_fora.toUpperCase().includes('GAIA') && match.resultado_fora! > match.resultado_casa!)
    )
    const hasHora = match.hora && match.hora.replace(/[^0-9]/g, '').length > 0

    return (
        <div className="max-w-xl mx-auto pb-24 px-3 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pt-3 animate-fade-in">
                <button onClick={() => window.history.back()} className="p-2 -ml-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                    <ArrowLeft size={22} />
                </button>
                <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-500">FICHA DE JOGO</span>
                <button onClick={shareGame} className="p-2 -mr-2 text-zinc-500 hover:text-gaia-yellow transition-colors">
                    <Share2 size={18} />
                </button>
            </div>

            {/* Hero Card */}
            <div className="glass-card overflow-hidden animate-slide-up">
                <div className="flex justify-between items-center p-4 pb-2 border-b border-zinc-100 dark:border-white/5">
                    <div className="flex items-center gap-2 min-w-0">
                        {!isFinished && !isLive && hasHora && (
                            <>
                                <Clock size={12} className="text-gaia-yellow shrink-0" strokeWidth={3} />
                                <span className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 tracking-wider">{match.hora!.slice(0, 5)}</span>
                            </>
                        )}
                        {isFinished && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isGaiaWin ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
                                {isGaiaWin ? 'VITÓRIA' : 'DERROTA'}
                            </span>
                        )}
                        {isLive && (
                            <span className="text-red-500 text-[10px] font-bold flex items-center gap-1 animate-pulse">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> LIVE
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider truncate">{match.escalao}</span>
                    </div>
                </div>

                <div className="p-4 flex flex-col gap-3">
                    <TeamRow name={match.equipa_casa} logo={match.logotipo_casa} score={isFinished || isLive ? match.resultado_casa : null} dimmed={isFinished && match.resultado_casa !== null && match.resultado_fora !== null && match.resultado_casa < match.resultado_fora} />
                    {!isFinished && !isLive && (
                        <div className="text-center text-xs font-bold text-zinc-400 uppercase tracking-wider py-1">VS</div>
                    )}
                    <TeamRow name={match.equipa_fora} logo={match.logotipo_fora} score={isFinished || isLive ? match.resultado_fora : null} dimmed={isFinished && match.resultado_casa !== null && match.resultado_fora !== null && match.resultado_fora < match.resultado_casa} />
                </div>

                {/* Bottom bar with date, location, FPB link */}
                <div className="px-4 pb-4 pt-0 flex flex-col gap-1 text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                    <div className="flex items-center gap-1.5">
                        <Clock size={10} className="text-gaia-yellow shrink-0" />
                        <span>{dateFormatted}{hasHora ? ` · ${match.hora!.slice(0, 5)}` : ''}</span>
                    </div>
                    {match.local && (
                        <div className="flex items-center gap-1.5">
                            <MapPin size={10} className="text-gaia-yellow shrink-0" />
                            <span className="truncate">{match.local}</span>
                            <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(match.local)}`} target="_blank" rel="noopener noreferrer" className="text-gaia-yellow hover:underline shrink-0">
                                <Navigation size={10} />
                            </a>
                        </div>
                    )}
                    {match.id && (
                        <a href={`https://www.fpb.pt/ficha-de-jogo?internalID=${match.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500 hover:text-gaia-yellow transition-colors">
                            <ExternalLink size={10} />
                            <span>Ver jogo na FPB</span>
                        </a>
                    )}
                </div>
            </div>

            {/* Últimos Jogos */}
            {recentGames.length > 0 && (
                <div className="glass-card overflow-hidden animate-slide-up">
                    <div className="p-4 border-b border-zinc-100 dark:border-white/5">
                        <h3 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-gaia-yellow" />
                            Últimos Jogos
                            <span className="text-zinc-500 dark:text-zinc-500 font-medium truncate">FC GAIA vs {match.equipa_fora.toUpperCase().includes('GAIA') ? match.equipa_casa : match.equipa_fora}</span>
                        </h3>
                    </div>
                    <div className="divide-y divide-zinc-100 dark:divide-white/5">
                        {recentGames.map((game) => {
                            const isGaiaHome = game.equipa_casa.toUpperCase().includes('GAIA')
                            const opponent = isGaiaHome ? game.equipa_fora : game.equipa_casa
                            const gaiaScore = isGaiaHome ? game.resultado_casa : game.resultado_fora
                            const oppScore = isGaiaHome ? game.resultado_fora : game.resultado_casa
                            const won = gaiaScore !== null && oppScore !== null && gaiaScore > oppScore
                            const shortDate = new Date(game.data).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' })

                            return (
                                <Link to={`/game/${game.slug}`} key={game.slug} className="flex items-center gap-3 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                    {won ? (
                                        <TrendingUp size={12} className="text-green-500 shrink-0" />
                                    ) : (
                                        <TrendingDown size={12} className="text-red-500 shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-zinc-900 dark:text-white truncate group-hover:text-gaia-yellow transition-colors">
                                            <span className="font-bold">FC GAIA</span>
                                            <span className="text-zinc-500 mx-1">{gaiaScore}-{oppScore}</span>
                                            <span className="text-zinc-400 dark:text-zinc-500">{opponent}</span>
                                        </p>
                                    </div>
                                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase shrink-0">{shortDate}</span>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Próximos Confrontos */}
            {upcomingH2H.length > 0 && (
                <div className="glass-card overflow-hidden animate-slide-up">
                    <div className="p-4 border-b border-zinc-100 dark:border-white/5">
                        <h3 className="text-xs font-bold text-zinc-900 dark:text-white">Próximos Confrontos</h3>
                    </div>
                    <div className="divide-y divide-zinc-100 dark:divide-white/5">
                        {upcomingH2H.map((game) => {
                            const isGaiaHome = game.equipa_casa.toUpperCase().includes('GAIA')
                            const opponent = isGaiaHome ? game.equipa_fora : game.equipa_casa
                            const shortDate = new Date(game.data).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' })
                            const time = (game.hora || '').slice(0, 5)

                            return (
                                <Link to={`/game/${game.slug}`} key={game.slug} className="flex items-center gap-3 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-zinc-900 dark:text-white truncate group-hover:text-gaia-yellow transition-colors">
                                            <span className="font-bold">FC GAIA</span>
                                            <span className="text-zinc-400 mx-1">vs</span>
                                            <span className="text-zinc-500">{opponent}</span>
                                        </p>
                                    </div>
                                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase shrink-0">{shortDate}{time ? ` · ${time}` : ''}</span>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

function TeamRow({ name, logo, score, dimmed }: { name: string; logo: string | null; score: number | null; dimmed: boolean }) {
    return (
        <div className={`flex items-center justify-between ${dimmed ? 'opacity-60' : ''}`}>
            <div className="flex items-center gap-3 min-w-0">
                {logo ? (
                    <img src={logo} alt="" className="w-8 h-8 object-contain rounded-full bg-zinc-50 dark:bg-zinc-800" loading="lazy" />
                ) : (
                    <div className="w-8 h-8 bg-zinc-100 dark:bg-white/10 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">{name.charAt(0).toUpperCase()}</span>
                    </div>
                )}
                <span className="text-sm font-bold text-zinc-900 dark:text-white leading-tight truncate">
                    {name.toUpperCase()}
                </span>
            </div>
            {score !== null && (
                <span className="text-xl font-mono font-bold text-zinc-900 dark:text-white tabular-nums shrink-0 ml-2">
                    {score}
                </span>
            )}
        </div>
    )
}

export default Game
