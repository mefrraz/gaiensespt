import { useState, useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { TrendingUp, TrendingDown, Minus, ArrowLeft } from 'lucide-react'
import { useClub } from '../lib/ClubContext'
import { supabase } from '../lib/supabase'
import { Match } from '../components/types'

export default function TeamDetail() {
    const { clubSlug, escalao } = useParams<{ clubSlug: string; escalao: string }>()
    const { clubName } = useClub()
    const [games, setGames] = useState<Match[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!clubName || !escalao) return
        setLoading(true)
        supabase.from('games_2025_2026')
            .select('*').or(`equipa_casa.ilike.%${clubName}%,equipa_fora.ilike.%${clubName}%`)
            .order('data', { ascending: false })
            .then(({ data }) => {
                if (data) setGames(data as Match[])
                setLoading(false)
            })
    }, [clubName, escalao])

    const filtered = useMemo(() => games.filter(g => g.escalao === escalao), [games, escalao])
    const finished = filtered.filter(g => g.status === 'FINALIZADO')
    const scheduled = filtered.filter(g => g.status !== 'FINALIZADO').sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())

    const form = finished.slice(0, 5).reverse().map(g => {
        const score = g.equipa_casa.toUpperCase().includes(clubName.toUpperCase()) ? g.resultado_casa : g.resultado_fora
        const opp = g.equipa_casa.toUpperCase().includes(clubName.toUpperCase()) ? g.resultado_fora : g.resultado_casa
        if (score === null || opp === null) return null
        if (score > opp) return 'W'
        if (score === opp) return 'D'
        return 'L'
    }).filter(Boolean) as ('W' | 'D' | 'L')[]

    return (
        <div className="max-w-xl mx-auto pb-24 px-3">
            <Link to={`/clube/${clubSlug}/equipas`} className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-violet-600 mb-4 pt-2 group">
                <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Equipas
            </Link>

            <h1 className="text-xl font-black text-zinc-900 dark:text-white mb-1">{escalao}</h1>
            <p className="text-xs text-zinc-500 mb-5">{clubName} · 2025/2026</p>

            {loading ? (
                <div className="flex justify-center py-16"><div className="w-6 h-6 rounded-full border-2 border-violet-600 border-t-transparent animate-spin" /></div>
            ) : (
                <>
                    {form.length > 0 && (
                        <div className="mb-5">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Forma</p>
                            <div className="flex gap-1.5">
                                {form.map((f, i) => (
                                    <span key={i} className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold ${f === 'W' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : f === 'D' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' : 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'}`}>
                                        {f === 'W' ? 'V' : f === 'D' ? 'E' : 'D'}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {finished.length > 0 && (
                        <div className="mb-5">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Últimos Resultados</p>
                            <div className="space-y-1.5">
                                {finished.slice(0, 10).map(g => {
                                    const score = g.equipa_casa.toUpperCase().includes(clubName.toUpperCase()) ? g.resultado_casa : g.resultado_fora
                                    const opp = g.equipa_casa.toUpperCase().includes(clubName.toUpperCase()) ? g.resultado_fora : g.resultado_casa
                                    const won = score !== null && opp !== null && score > opp
                                    return (
                                        <Link to={`/clube/${clubSlug}/jogo/${g.slug}`} key={g.slug}
                                            className="flex items-center gap-2 p-2.5 bg-white dark:bg-zinc-900/80 border border-zinc-100 dark:border-zinc-800/50 rounded-xl hover:border-violet-600/30 transition-all">
                                            {won ? <TrendingUp size={14} className="text-emerald-500 shrink-0" /> : score === opp ? <Minus size={14} className="text-blue-500 shrink-0" /> : <TrendingDown size={14} className="text-red-500 shrink-0" />}
                                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">{g.equipa_casa} {g.resultado_casa}-{g.resultado_fora} {g.equipa_fora}</span>
                                            <span className="text-[10px] text-zinc-400 ml-auto shrink-0">{new Date(g.data).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })}</span>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {scheduled.length > 0 && (
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Próximos Jogos</p>
                            <div className="space-y-1.5">
                                {scheduled.map(g => (
                                    <Link to={`/clube/${clubSlug}/jogo/${g.slug}`} key={g.slug}
                                        className="flex items-center gap-2 p-2.5 bg-white dark:bg-zinc-900/80 border border-zinc-100 dark:border-zinc-800/50 rounded-xl hover:border-violet-600/30 transition-all">
                                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">{g.equipa_casa} <span className="text-zinc-400">vs</span> {g.equipa_fora}</span>
                                        <span className="text-[10px] text-zinc-400 ml-auto shrink-0">{new Date(g.data).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {filtered.length === 0 && <p className="text-center py-12 text-zinc-400">Nenhum jogo encontrado.</p>}
                </>
            )}
        </div>
    )
}
