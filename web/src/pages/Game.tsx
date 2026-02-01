import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, MapPin, Calendar, Clock, Loader2 } from 'lucide-react'
import { Match } from './Home'

function Game() {
    const { slug } = useParams()
    const [match, setMatch] = useState<Match | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchMatch = async () => {
            if (!slug) return
            setLoading(true)
            const { data, error } = await supabase
                .from('partidas')
                .select('*')
                .eq('slug', slug)
                .single()

            if (error) console.error(error)
            else setMatch(data)
            setLoading(false)
        }

        fetchMatch()

        // Realtime subscription for this specific match could be added here
    }, [slug])

    if (loading) return (
        <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-gaia-blue" size={48} />
        </div>
    )

    if (!match) return (
        <div className="text-center py-20">
            <p className="text-gray-500 mb-4">Jogo não encontrado.</p>
            <Link to="/" className="text-gaia-blue hover:underline">Voltar</Link>
        </div>
    )

    const dateFormatted = new Date(match.data).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

    return (
        <div className="max-w-3xl mx-auto space-y-6">

            {/* Back Button */}
            <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gaia-blue transition-colors mb-4">
                <ArrowLeft size={18} />
                Voltar à Agenda
            </Link>

            {/* Scoreboard Card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden relative">

                {/* Header Strip */}
                <div className="bg-gaia-blue text-white p-3 text-center text-sm font-semibold tracking-widest uppercase">
                    {match.competicao} — {match.escalao}
                </div>

                <div className="p-6 md:p-10 flex flex-col gap-8">

                    {/* Status */}
                    <div className="text-center">
                        {match.status === 'A DECORRER' ? (
                            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                                EM DIRETO
                            </span>
                        ) : (
                            <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                                {match.status}
                            </span>
                        )}
                    </div>

                    {/* Teams & Score */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">

                        {/* Home */}
                        <div className="flex-1 text-center md:text-right">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white leading-tight">
                                {match.equipa_casa}
                            </h2>
                        </div>

                        {/* Score Block */}
                        <div className="bg-gray-100 dark:bg-black/40 px-6 py-4 rounded-xl border border-gray-200 dark:border-white/10 mx-auto min-w-[140px] text-center">
                            {match.resultado_casa !== null && match.resultado_fora !== null ? (
                                <div className="text-4xl md:text-5xl font-mono font-bold text-gaia-blue dark:text-blue-400">
                                    {match.resultado_casa} <span className="text-gray-300/50 mx-1">-</span> {match.resultado_fora}
                                </div>
                            ) : (
                                <div className="text-3xl font-mono text-gray-400">
                                    VS
                                </div>
                            )}
                        </div>

                        {/* Away */}
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white leading-tight">
                                {match.equipa_fora}
                            </h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-white/5 flex items-center gap-4">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full text-gaia-blue">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 uppercase font-bold">Data</div>
                        <div className="text-gray-800 dark:text-gray-200 font-medium capitalize">{dateFormatted}</div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-white/5 flex items-center gap-4">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full text-gaia-blue">
                        <Clock size={24} />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 uppercase font-bold">Hora</div>
                        <div className="text-gray-800 dark:text-gray-200 font-medium">{match.hora || 'A definir'}</div>
                    </div>
                </div>
            </div>

            {/* Location Placeholder */}
            <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-white/5 text-center space-y-3 opacity-75">
                <MapPin className="mx-auto text-gray-400" size={32} />
                <p className="text-gray-500">Localização do pavilhão em breve...</p>
            </div>

        </div>
    )
}

export default Game
