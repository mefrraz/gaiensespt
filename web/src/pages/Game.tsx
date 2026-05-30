import { useEffect, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { fetchFPBGames } from '../lib/fpbApi'
import { fetchGameDetail, type FPBGameDetail, type FPBBoxScorePlayer } from '../lib/fpbCompetitionsApi'
import { ArrowLeft, MapPin, Share2, Trophy, Navigation, TrendingUp, TrendingDown, ExternalLink, Calendar, Minus, Check, Clock } from 'lucide-react'
import { SkeletonHero } from '../components/Skeleton'
import { Match } from '../components/types'
import { useClub, type Club } from '../lib/ClubContext'

function detailToMatch(detail: FPBGameDetail): Match {
    return {
        id: detail.internalID,
        slug: detail.internalID,
        data: detail.data,
        hora: detail.hora || '',
        equipa_casa: detail.equipa_casa,
        equipa_fora: detail.equipa_fora,
        resultado_casa: detail.resultado_casa,
        resultado_fora: detail.resultado_fora,
        escalao: detail.fase,
        competicao: detail.competicao,
        local: detail.pavilhao,
        logotipo_casa: detail.logo_casa,
        logotipo_fora: detail.logo_fora,
        status: (detail.status || 'FINALIZADO') as Match['status'],
    }
}

function Game() {
    const { slug } = useParams()
    const [searchParams] = useSearchParams()
    const clubSlug = searchParams.get('clube') || ''
    const { getClubBySlug, clubs } = useClub()

    const [match, setMatch] = useState<Match | null>(null)
    const [club, setClub] = useState<Club | null>(null)
    const [detailLeaders, setDetailLeaders] = useState<FPBGameDetail['gameLeaders']>([])
    const [detailAbrev, setDetailAbrev] = useState<{ casa: string; fora: string }>({ casa: '', fora: '' })
    const [boxScoreCasa, setBoxScoreCasa] = useState<FPBBoxScorePlayer[]>([])
    const [boxScoreFora, setBoxScoreFora] = useState<FPBBoxScorePlayer[]>([])
    const [detailTeamStats, setDetailTeamStats] = useState<{ label: string; casa: string; fora: string }[]>([])
    const [activeLeaderTab, setActiveLeaderTab] = useState(0)
    const [recentGames, setRecentGames] = useState<Match[]>([])
    const [upcomingH2H, setUpcomingH2H] = useState<Match[]>([])
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (clubSlug) {
            getClubBySlug(clubSlug).then(setClub)
        }
    }, [clubSlug, getClubBySlug])

    useEffect(() => {
        if (!slug) return
        setLoading(true)

        const tryLoad = async () => {
            // 1) Try all Supabase seasons first
            const tables = ['games_2025_2026', 'games_2024_2025', 'games_2023_2024', 'games_2022_2023']
            for (const table of tables) {
                const { data, error } = await supabase
                    .from(table)
                    .select('*')
                    .eq('slug', slug)
                    .single()
                if (!error && data) {
                    setMatch(data as Match)
                    setLoading(false)
                    return
                }
            }

            // 2) If no club in URL, try competition game detail (slug is numeric internalID)
            if (!clubSlug && /^\d+$/.test(slug)) {
                try {
                    const detail = await fetchGameDetail(slug)
                    if (detail) {
                        setMatch(detailToMatch(detail))
                        setDetailLeaders(detail.gameLeaders)
                        setDetailAbrev({ casa: detail.abrev_casa, fora: detail.abrev_fora })
                        setBoxScoreCasa(detail.boxScoreCasa)
                        setBoxScoreFora(detail.boxScoreFora)
                        setDetailTeamStats(detail.teamStats)
                    }
                } catch { /* ignore */ }
                setLoading(false)
                return
            }

            // 3) If no club in URL, stop here
            if (!clubSlug) {
                setLoading(false)
                return
            }

            // 3) Wait for club to load, then try FPB API
            //    (club will be null until getClubBySlug resolves — keep loading)
            if (!club) return // re-run when club loads

            try {
                const seasons = ['2025/2026', '2024/2025', '2023/2024', '2022/2023']
                for (const season of seasons) {
                    const fpbGames = await fetchFPBGames(season, club.id)
                    const found = fpbGames.find(g => g.slug === slug)
                    if (found) {
                        setMatch(found)
                        setLoading(false)
                        return
                    }
                }
            } catch (err) {
                console.warn('FPB fallback failed:', err)
            }

            setLoading(false)
        }

        tryLoad()
    }, [slug, club])

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && slug) {
                supabase
                    .from('games_2025_2026')
                    .select('*')
                    .eq('slug', slug)
                    .single()
                    .then(({ data, error }) => {
                        if (!error && data) setMatch(data as Match)
                    })
            }
        }
        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
    }, [slug, club])

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

    const shareGame = async () => {
        if (!match) return
        const hasScore = match.resultado_casa !== null && match.resultado_fora !== null
        const scoreText = hasScore ? `${match.resultado_casa} - ${match.resultado_fora}` : 'vs'

        const shareData = {
            title: `${match.equipa_casa} ${scoreText} ${match.equipa_fora}`,
            text: `🏀 ${match.equipa_casa} ${scoreText} ${match.equipa_fora}\n📅 ${new Date(match.data).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}\n🏆 ${match.competicao}\n\n🔗 ${window.location.href}`,
            url: window.location.href
        }

        if (navigator.share) {
            try {
                await navigator.share(shareData)
            } catch { /* user cancelled */ }
        } else {
            await navigator.clipboard.writeText(shareData.text)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
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
                <button onClick={() => window.history.back()} className="text-xs font-bold text-dribly-blue hover:underline">Voltar</button>
            </div>
        )
    }

    const isFinished = match.status === 'FINALIZADO'
    const isLive = match.status === 'A DECORRER'
    const hasScores = match.resultado_casa !== null && match.resultado_fora !== null
    const casaHighlight = hasScores && match.resultado_casa! > match.resultado_fora!
    const foraHighlight = hasScores && match.resultado_fora! > match.resultado_casa!
    const dateFormatted = new Date(match.data).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    const hasHora = match.hora && match.hora.replace(/[^0-9]/g, "").length > 0

    // Club context
    const clubUpper = club ? club.name.toUpperCase() : ''
    const isClubWin = clubUpper && hasScores ? (
        (match.equipa_casa.toUpperCase().includes(clubUpper) && match.resultado_casa! > match.resultado_fora!) ||
        (match.equipa_fora.toUpperCase().includes(clubUpper) && match.resultado_fora! > match.resultado_casa!)
    ) : null
    const isDraw = hasScores && match.resultado_casa === match.resultado_fora

    // Top 3 players per team by VAL
    const top3Casa = [...boxScoreCasa].filter(p => p.pts > 0).sort((a, b) => (b.val || 0) - (a.val || 0)).slice(0, 3)
    const top3Fora = [...boxScoreFora].filter(p => p.pts > 0).sort((a, b) => (b.val || 0) - (a.val || 0)).slice(0, 3)

    return (
        <div className="max-w-7xl mx-auto pb-24 px-3 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between pt-3 animate-fade-in">
                <button onClick={() => window.history.back()} className="p-2 -ml-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                    <ArrowLeft size={22} />
                </button>
                <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-500">FICHA DE JOGO</span>
                <button onClick={shareGame} className={`p-2 -mr-2 transition-colors ${copied ? 'text-green-500' : 'text-zinc-500 hover:text-dribly-blue'}`}>
                    {copied ? <Check size={18} /> : <Share2 size={18} />}
                </button>
            </div>

            {/* Content grid — sidebars + center */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px_1fr] gap-4">
                {/* Left sidebar — sticky stats (desktop only) */}
                <div className="hidden lg:block">
                    <div className="sticky top-20 space-y-3">
                        <SideStats team={match.equipa_casa} label="Casa" stats={detailTeamStats} />
                    </div>
                </div>

                {/* Center */}
                <div className="space-y-3">

            {/* Hero Card */}
            <div className="glass-card overflow-hidden animate-slide-up group hover:border-dribly-blue/30 transition-all duration-200">
                <div className="bg-gradient-to-r from-dribly-blue/10 via-zinc-50 to-dribly-blue/10 dark:from-dribly-blue/5 dark:via-zinc-900 dark:to-dribly-blue/5 border-b border-zinc-100 dark:border-white/5 p-3 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-dribly-blue uppercase">{match.escalao}</span>
                    <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 uppercase truncate ml-2">{match.competicao}</span>
                </div>

                <div className="p-6 pt-8 pb-6">
                    <div className="flex justify-center mb-5 min-h-[1.5rem]">
                        {isFinished && hasScores && (
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                                !clubUpper
                                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                                    : isDraw
                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                        : isClubWin
                                            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                            }`}>
                                {!clubUpper ? 'FINALIZADO' : isDraw ? 'EMPATE' : isClubWin ? 'VITÓRIA' : 'DERROTA'}
                            </span>
                        )}
                        {isLive && (
                            <span className="px-3 py-1 rounded-full bg-red-500 text-white text-[10px] font-bold animate-pulse">AO VIVO</span>
                        )}
                        {match.status === 'AGENDADO' && hasHora && (
                            <span className="px-3 py-1 rounded-full bg-dribly-purple/10 text-dribly-purple text-[10px] font-bold flex items-center gap-1">
                                <Clock size={10} /> {match.hora!.slice(0, 5)}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        <TeamBlock name={match.equipa_casa} logo={match.logotipo_casa} abrev={detailAbrev.casa || undefined} clubSlug={(() => { const n = match.equipa_casa; const found = clubs.find(c => n.toUpperCase().includes(c.name.toUpperCase())); return found ? found.slug : null })()} />
                        <div className="flex flex-col items-center gap-1 shrink-0">
                            {isFinished || isLive ? (
                                <div className="flex items-center gap-1 sm:gap-3">
                                    <span className={`text-2xl sm:text-5xl font-bold font-mono tabular-nums tracking-tighter ${
                                        casaHighlight ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-500'
                                    }`}>{match.resultado_casa ?? '-'}</span>
                                    <span className="text-base sm:text-2xl font-light text-zinc-400">:</span>
                                    <span className={`text-2xl sm:text-5xl font-bold font-mono tabular-nums tracking-tighter ${
                                        foraHighlight ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-500'
                                    }`}>{match.resultado_fora ?? '-'}</span>
                                </div>
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                    <span className="text-sm font-black text-zinc-400 dark:text-zinc-500">VS</span>
                                </div>
                            )}
                        </div>
                        <TeamBlock name={match.equipa_fora} logo={match.logotipo_fora} abrev={detailAbrev.fora || undefined} clubSlug={(() => { const n = match.equipa_fora; const found = clubs.find(c => n.toUpperCase().includes(c.name.toUpperCase())); return found ? found.slug : null })()} />
                    </div>



                    {/* FPB Link */}
                    <div className="mt-6 flex justify-center">
                        {match.id && (
                            <a href={`https://www.fpb.pt/ficha-de-jogo?internalID=${match.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 hover:text-dribly-blue transition-colors">
                                <ExternalLink size={10} />
                                Ver jogo na FPB
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Location Card */}
            <div className="glass-card p-5 flex items-start gap-4 animate-slide-up">
                <div className="p-3 rounded-full bg-zinc-100 dark:bg-white/5 text-dribly-blue shrink-0">
                    <MapPin size={20} />
                </div>
                <div className="min-w-0">
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-1">Localização</h4>
                    {match.local ? (
                        <>
                            <p className="text-sm font-medium text-zinc-900 dark:text-white mb-2 break-words">{match.local}</p>
                            <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(match.local)}`}
                               target="_blank" rel="noopener noreferrer"
                               className="inline-flex items-center gap-1.5 text-[10px] font-bold text-dribly-blue hover:text-black dark:hover:text-white transition-colors group">
                                <Navigation size={12} />
                                <span className="group-hover:underline">Abrir no Google Maps</span>
                            </a>
                        </>
                    ) : (
                        <p className="text-sm text-zinc-500 italic">A definir</p>
                    )}
                </div>
            </div>

            {/* Date Card */}
            <div className="glass-card p-5 flex items-start gap-4 animate-slide-up">
                <div className="p-3 rounded-full bg-zinc-100 dark:bg-white/5 text-dribly-blue shrink-0">
                    <Calendar size={20} />
                </div>
                <div>
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-1">Data</h4>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white capitalize">{dateFormatted}</p>
                </div>
            </div>

            {/* Game Leaders — player head-to-head */}
            {detailLeaders.length > 0 && (
                <div className="glass-card overflow-hidden animate-slide-up">
                    <div className="p-4 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between">
                        <h3 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-dribly-purple" />
                            Melhores em Campo
                        </h3>
                    </div>
                    <div className="p-3 flex gap-1.5 overflow-x-auto">
                        {detailLeaders.map((l, i) => (
                            <button key={i} onClick={() => setActiveLeaderTab(i)}
                                className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                                    i === activeLeaderTab
                                        ? 'bg-dribly-purple text-white'
                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                }`}>
                                {l.categoria}
                            </button>
                        ))}
                    </div>
                    {detailLeaders[activeLeaderTab] && (
                        <div className="px-4 pb-4 flex items-center gap-3">
                            <PlayerMiniCard nome={detailLeaders[activeLeaderTab].casa.nome} foto={detailLeaders[activeLeaderTab].casa.foto} valor={detailLeaders[activeLeaderTab].casa.valor} side="left" />
                            <span className="text-[10px] font-bold text-zinc-400 shrink-0">vs</span>
                            <PlayerMiniCard nome={detailLeaders[activeLeaderTab].fora.nome} foto={detailLeaders[activeLeaderTab].fora.foto} valor={detailLeaders[activeLeaderTab].fora.valor} side="right" />
                        </div>
                    )}
                </div>
            )}

            {/* Comparação com barras visuais */}
            {detailTeamStats.length > 0 && (
                <div className="glass-card overflow-hidden animate-slide-up">
                    <div className="p-4 border-b border-zinc-100 dark:border-white/5">
                        <h3 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-dribly-purple" />
                            Comparação
                        </h3>
                    </div>
                    <div className="p-4 space-y-4">
                        {detailTeamStats.filter(s => !/^\d/.test(s.label)).slice(0, 10).map((stat, i) => {
                            const cv = parseInt(stat.casa) || 0
                            const fv = parseInt(stat.fora) || 0
                            const total = cv + fv || 1
                            const cpct = (cv / total) * 100
                            return (
                                <div key={i}>
                                    <div className="flex justify-between text-[10px] font-bold mb-1">
                                        <span className="text-dribly-purple">{stat.casa}</span>
                                        <span className="text-zinc-400 uppercase text-[9px]">{stat.label}</span>
                                        <span className="text-zinc-700 dark:text-zinc-300">{stat.fora}</span>
                                    </div>
                                    <div className="flex h-2 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                                        <div className="h-full bg-dribly-purple rounded-full" style={{ width: cpct + '%' }} />
                                        <div className="h-full bg-zinc-300 dark:bg-zinc-600" style={{ width: (100 - cpct) + '%' }} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Top players por VAL */}
            {(top3Casa.length > 0 || top3Fora.length > 0) && (
                <div className="glass-card overflow-hidden animate-slide-up">
                    <div className="p-4 border-b border-zinc-100 dark:border-white/5">
                        <h3 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-dribly-purple" />
                            Top Performers
                        </h3>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase mb-2">{match.equipa_casa}</p>
                            <div className="space-y-2">
                                {top3Casa.map((p, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-zinc-400 w-5">{p.numero || '-'}</span>
                                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex-1 truncate">{p.nome}</span>
                                        <span className="text-xs font-black text-dribly-purple tabular-nums">{p.pts}P</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase mb-2">{match.equipa_fora}</p>
                            <div className="space-y-2">
                                {top3Fora.map((p, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-zinc-400 w-5">{p.numero || '-'}</span>
                                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex-1 truncate">{p.nome}</span>
                                        <span className="text-xs font-black text-dribly-purple tabular-nums">{p.pts}P</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* H2H History */}
            {recentGames.length > 0 && (
                <div className="glass-card overflow-hidden animate-slide-up">
                    <div className="p-4 border-b border-zinc-100 dark:border-white/5">
                        <h3 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-dribly-blue" />
                            Últimos Confrontos
                            <span className="text-zinc-500 dark:text-zinc-500 font-medium truncate">{match.equipa_casa} vs {match.equipa_fora}</span>
                        </h3>
                    </div>
                    <div className="divide-y divide-zinc-100 dark:divide-white/5">
                        {recentGames.map((game) => {
                            const isHome = game.equipa_casa.toUpperCase().includes(match.equipa_casa.toUpperCase().substring(0, 5))
                            const firstTeam = isHome ? game.equipa_casa : game.equipa_fora
                            const secondTeam = isHome ? game.equipa_fora : game.equipa_casa
                            const firstScore = isHome ? game.resultado_casa : game.resultado_fora
                            const secondScore = isHome ? game.resultado_fora : game.resultado_casa
                            const firstWon = firstScore !== null && secondScore !== null && firstScore > secondScore
                            const draw = firstScore !== null && secondScore !== null && firstScore === secondScore
                            const shortDate = new Date(game.data).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' })

                            return (
                                <Link to={`/game/${game.slug}${clubSlug ? `?clube=${clubSlug}` : ''}`} key={game.slug} className="flex items-center gap-3 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                    {firstWon ? (
                                        <TrendingUp size={12} className="text-green-500 shrink-0" />
                                    ) : draw ? (
                                        <Minus size={12} className="text-blue-500 shrink-0" />
                                    ) : (
                                        <TrendingDown size={12} className="text-red-500 shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-zinc-900 dark:text-white truncate group-hover:text-dribly-blue transition-colors">
                                            <span className={firstWon ? 'font-bold' : ''}>{firstTeam}</span>
                                            <span className="text-zinc-500 mx-1">{firstScore}-{secondScore}</span>
                                            <span className="text-zinc-400 dark:text-zinc-500">{secondTeam}</span>
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
                        <h3 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-dribly-blue" />
                            Próximos Confrontos
                            <span className="text-zinc-500 dark:text-zinc-500 font-medium truncate">{match.equipa_casa} vs {match.equipa_fora}</span>
                        </h3>
                    </div>
                    <div className="divide-y divide-zinc-100 dark:divide-white/5">
                        {upcomingH2H.map((game) => {
                            const opponent = game.equipa_casa.toUpperCase().includes(match.equipa_casa.toUpperCase().substring(0, 5))
                                ? game.equipa_fora : game.equipa_casa
                            const shortDate = new Date(game.data).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' })

                            return (
                                <Link to={`/game/${game.slug}${clubSlug ? `?clube=${clubSlug}` : ''}`} key={game.slug} className="flex items-center gap-3 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                    <TrendingUp size={12} className="text-dribly-blue shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-zinc-900 dark:text-white truncate group-hover:text-dribly-blue transition-colors">
                                            <span className="font-bold">{match.equipa_casa}</span>
                                            <span className="text-zinc-400 mx-1">vs</span>
                                            <span className="text-zinc-500">{opponent}</span>
                                        </p>
                                    </div>
                                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase shrink-0">{shortDate}</span>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}

                </div>{/* End center */}
                {/* Right sidebar — sticky stats (desktop only) */}
                <div className="hidden lg:block">
                    <div className="sticky top-20 space-y-3">
                        <SideStats team={match.equipa_fora} label="Fora" stats={detailTeamStats} />
                    </div>
                </div>
            </div>{/* End grid */}
        </div>
    )
}

function TeamBlock({ name, logo, clubSlug, abrev }: { name: string; logo: string | null; clubSlug?: string | null; abrev?: string }) {
    const content = (
        <div className="flex-1 flex flex-col items-center text-center gap-1 min-w-0">
            <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                {logo ? (
                    <img src={logo} alt="" className="w-14 h-14 object-contain" />
                ) : (
                    <span className="text-2xl font-bold text-zinc-500">{abrev?.charAt(0) || name.charAt(0)}</span>
                )}
            </div>
            <p className="text-xs font-black text-zinc-900 dark:text-white leading-tight truncate w-full">
                {abrev ? abrev.toUpperCase() : name.toUpperCase()}
            </p>
        </div>
    );
    if (clubSlug) {
        return <Link to={"/clube/" + clubSlug + "/home"} className="flex-1 hover:opacity-80 transition-opacity">{content}</Link>;
    }
    return content;
}

function PlayerMiniCard({ nome, foto, valor, side }: { nome: string; foto?: string; valor: string; side: 'left' | 'right' }) {
    return (
        <div className={`flex-1 flex items-center gap-2 ${side === 'right' ? 'flex-row-reverse text-right' : ''}`}>
            {foto ? (
                <img src={foto} alt="" className="w-10 h-10 rounded-full object-cover shrink-0 border-2 border-zinc-100 dark:border-zinc-700" />
            ) : (
                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-zinc-500">{nome?.charAt(0) || '?'}</span>
                </div>
            )}
            <div className="min-w-0">
                <p className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 truncate max-w-[100px]">{nome}</p>
                <p className="text-sm font-black text-dribly-purple tabular-nums">{valor}</p>
            </div>
        </div>
    )
}

function SideStats({ team, stats }: { team: string; label: string; stats: { label: string; casa: string; fora: string }[] }) {
    const relevant = stats.filter(s => /\d/.test(s.label) || s.label.length < 15).slice(0, 6)
    if (!relevant.length) return null
    return (
        <div className="glass-card p-4 space-y-3">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{team}</p>
            {relevant.map((s, i) => (
                <div key={i}>
                    <div className="flex justify-between text-[10px] font-bold mb-0.5">
                        <span className="text-dribly-purple">{s.casa}</span>
                        <span className="text-zinc-400 capitalize text-[9px]">{s.label}</span>
                        <span className="text-zinc-700 dark:text-zinc-300">{s.fora}</span>
                    </div>
                    <div className="flex h-1.5 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                        {(() => {
                            const cv = parseInt(s.casa) || 0, fv = parseInt(s.fora) || 0, total = cv + fv || 1
                            return <div className="h-full bg-dribly-purple rounded-full" style={{ width: (cv/total*100) + '%' }} />
                        })()}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default Game
