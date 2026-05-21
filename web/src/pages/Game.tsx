import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, MapPin, Calendar, Share2, Trophy } from 'lucide-react'
import { Match } from '../components/types'

function Game() {
    const { slug } = useParams()
    const [match, setMatch] = useState<Match | null>(null)
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
                <div className="glass-card p-6 animate-pulse">
                    <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-700 rounded mx-auto mb-8" />
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 flex flex-col items-center gap-3">
                            <div className="w-20 h-20 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
                            <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-700 rounded" />
                        </div>
                        <div className="h-12 w-20 bg-zinc-200 dark:bg-zinc-700 rounded shrink-0" />
                        <div className="flex-1 flex flex-col items-center gap-3">
                            <div className="w-20 h-20 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
                            <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-700 rounded" />
                        </div>
                    </div>
                </div>
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
                {/* Escalão + Competição */}
                <div className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-white/5 p-3 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gaia-yellow uppercase">{match.escalao}</span>
                    <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 uppercase truncate ml-2">{match.competicao}</span>
                </div>

                {/* Scoreboard */}
                <div className="p-6 pt-8 pb-6">
                    {/* Badge */}
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

                    {/* Teams */}
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
                                <span className="text-3xl font-black text-zinc-300 dark:text-zinc-700">VS</span>
                                <span className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                                    {(match.hora || '00:00').slice(0, 5)}
                                </span>
                            </div>
                        )}
                        <TeamBlock name={match.equipa_fora} logo={match.logotipo_fora} />
                    </div>

                    {/* Date/Time */}
                    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                        <span className="capitalize">{dateFormatted}</span>
                        <span className="w-1 h-1 rounded-full bg-zinc-300" />
                        <span className="font-mono">{(match.hora || '--:--').slice(0, 5)}</span>
                    </div>
                </div>
            </div>

            {/* Location */}
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
                               className="inline-flex items-center gap-1 text-[10px] font-bold bg-zinc-100 dark:bg-white/10 px-3 py-1.5 rounded-full hover:bg-gaia-yellow hover:text-black transition-colors whitespace-nowrap">
                                <MapPin size={10} />
                                Obter Direções
                            </a>
                        </>
                    ) : (
                        <p className="text-sm text-zinc-500 italic">A definir</p>
                    )}
                </div>
            </div>

            {/* Date/Time */}
            <div className="glass-card p-5 flex items-start gap-4 animate-slide-up">
                <div className="p-3 rounded-full bg-zinc-100 dark:bg-white/5 text-gaia-yellow shrink-0">
                    <Calendar size={20} />
                </div>
                <div>
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-1">Data e Hora</h4>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white capitalize">{dateFormatted}</p>
                    <p className="text-sm text-zinc-500 font-mono">{(match.hora || '00:00').slice(0, 5)}</p>
                </div>
            </div>

            {/* Boxscore placeholder */}
            {isFinished && (
                <div className="glass-card p-5 animate-slide-up">
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-3">Estatísticas</h4>
                    <p className="text-xs text-zinc-500 italic">Em breve: estatísticas detalhadas por jogador.</p>
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
