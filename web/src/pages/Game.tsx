import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, MapPin, Calendar, Share2, Trophy, Navigation } from 'lucide-react'
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
                <div className="bg-gradient-to-r from-gaia-yellow/10 via-zinc-50 to-gaia-yellow/10 dark:from-gaia-yellow/5 dark:via-zinc-900 dark:to-gaia-yellow/5 border-b border-zinc-100 dark:border-white/5 p-3 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gaia-yellow uppercase">{match.escalao}</span>
                    <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 uppercase truncate ml-2">{match.competicao}</span>
                </div>

                <div className="p-6 pt-8 pb-6">
                    {isFinished && (
                        <div className="flex justify-center mb-5">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                                isGaiaWin
                                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                            }`}>
                                {isGaiaWin ? 'VITÓRIA' : 'DERROTA'}
                            </span>
                        </div>
                    )}
                    {isLive && (
                        <div className="flex justify-center mb-5">
                            <span className="px-3 py-1 rounded-full bg-red-500 text-white text-[10px] font-bold animate-pulse">AO VIVO</span>
                        </div>
                    )}

                    <div className="flex items-center justify-between gap-4">
                        <TeamBlock name={match.equipa_casa} logo={match.logotipo_casa} />
                        {isFinished || isLive ? (
                            <div className="flex items-center gap-3 shrink-0">
                                <Score num={match.resultado_casa} highlight={gaiaScore && match.resultado_casa! >= match.resultado_fora!} />
                                <span className="text-2xl font-light text-zinc-400">:</span>
                                <Score num={match.resultado_fora} highlight={gaiaScore && match.resultado_fora! >= match.resultado_casa!} />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-1 shrink-0">
                                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center ring-2 ring-gaia-yellow/20">
                                    <span className="text-sm font-black text-zinc-400 dark:text-zinc-500">VS</span>
                                </div>
                            </div>
                        )}
                        <TeamBlock name={match.equipa_fora} logo={match.logotipo_fora} />
                    </div>

                    {/* Date */}
                    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                        <div className="h-px w-8 bg-zinc-200 dark:bg-white/10" />
                        <span className="capitalize font-medium">{dateFormatted}</span>
                        <div className="h-px w-8 bg-zinc-200 dark:bg-white/10" />
                    </div>
                </div>
            </div>

            {/* Location Card */}
            <div className="glass-card p-5 flex items-start gap-4 animate-slide-up">
                <div className="p-3 rounded-full bg-zinc-100 dark:bg-white/5 text-gaia-yellow shrink-0">
                    <MapPin size={20} />
                </div>
                <div className="min-w-0">
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-1">Localização</h4>
                    {match.local ? (
                        <>
                            <p className="text-sm font-medium text-zinc-900 dark:text-white mb-2 break-words">{match.local}</p>
                            <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(match.local)}`}
                               target="_blank" rel="noopener noreferrer"
                               className="inline-flex items-center gap-1.5 text-[10px] font-bold text-gaia-yellow hover:text-black dark:hover:text-white transition-colors group">
                                <Navigation size={12} />
                                <span className="group-hover:underline">Abrir no Google Maps</span>
                            </a>
                        </>
                    ) : (
                        <p className="text-sm text-zinc-500 italic">A definir</p>
                    )}
                </div>
            </div>

            {/* Date/Time Card */}
            <div className="glass-card p-5 flex items-start gap-4 animate-slide-up">
                <div className="p-3 rounded-full bg-zinc-100 dark:bg-white/5 text-gaia-yellow shrink-0">
                    <Calendar size={20} />
                </div>
                <div>
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-1">Data</h4>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white capitalize">{dateFormatted}</p>
                    {hasHora && (
                        <p className="text-sm text-zinc-500 font-mono">{match.hora!.slice(0, 5)}</p>
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
                                <Link to={`/game/${game.slug}`} key={game.slug} className={`flex items-center gap-4 p-4 transition-colors group border-l-4 ${
                                    won ? 'border-l-green-500 hover:bg-green-50/50 dark:hover:bg-green-950/20' : 'border-l-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/20'
                                }`}>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-zinc-900 dark:text-white truncate group-hover:text-gaia-yellow transition-colors">
                                            FC GAIA
                                            <span className="text-zinc-500 mx-2 font-bold">{gaiaScore}-{oppScore}</span>
                                            <span className="text-zinc-400 dark:text-zinc-500 font-medium">{opponent}</span>
                                        </p>
                                    </div>
                                    <span className="text-xs text-zinc-500 dark:text-zinc-400 shrink-0 font-medium">{shortDate}</span>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Próximos Jogos */}
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
                                <Link to={`/game/${game.slug}`} key={game.slug} className="flex items-center gap-4 p-4 transition-colors group border-l-4 border-l-gaia-yellow hover:bg-gaia-yellow/5 dark:hover:bg-gaia-yellow/5">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-zinc-900 dark:text-white truncate group-hover:text-gaia-yellow transition-colors">
                                            FC GAIA
                                            <span className="text-zinc-400 mx-2 font-medium">vs</span>
                                            <span className="text-zinc-500 font-medium">{opponent}</span>
                                        </p>
                                    </div>
                                    <span className="text-xs text-zinc-500 dark:text-zinc-400 shrink-0 font-medium">{shortDate}{time ? ` · ${time}` : ''}</span>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

function TeamBlock({ name, logo }: { name: string; logo: string | null }) {
    return (
        <div className="flex-1 flex flex-col items-center text-center gap-2 min-w-0">
            <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden ring-2 ring-gaia-yellow/30 shrink-0">
                {logo ? (
                    <img src={logo} alt="" className="w-14 h-14 object-contain" />
                ) : (
                    <span className="text-2xl font-bold text-zinc-500">{name.charAt(0)}</span>
                )}
            </div>
            <p className="text-sm font-bold text-zinc-900 dark:text-white leading-tight truncate w-full">
                {name.toUpperCase()}
            </p>
        </div>
    )
}

function Score({ num, highlight }: { num: number | null; highlight: boolean }) {
    return (
        <span className={`text-5xl font-bold font-mono tabular-nums leading-none ${
            num !== null && highlight ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-500'
        }`}>
            {num ?? '-'}
        </span>
    )
}

export default Game
