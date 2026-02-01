import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, MapPin, Calendar, Loader2, Share2, Shield } from 'lucide-react'
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
    }, [slug])

    if (loading) return (
        <div className="flex justify-center py-32">
            <Loader2 className="animate-spin text-gaia-yellow" size={32} />
        </div>
    )

    if (!match) return (
        <div className="flex flex-col items-center justify-center py-32 text-center text-gray-500">
            <p className="mb-4 text-lg">Jogo não encontrado</p>
            <Link to="/" className="text-gaia-yellow font-bold hover:underline">Regressar</Link>
        </div>
    )

    const dateFormatted = new Date(match.data).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    const isFinished = match.status === 'FINALIZADO'

    return (
        <div className="max-w-xl mx-auto pb-12">

            {/* Nav */}
            <div className="flex items-center justify-between mb-6">
                <Link to="/" className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <div className="text-xs font-bold tracking-widest uppercase text-gray-500">
                    MATCH CENTER
                </div>
                <div className="w-10"></div> {/* Spacer */}
            </div>

            {/* Match Card */}
            <div className="glass-card p-0 overflow-hidden mb-6">

                {/* Competition Header */}
                <div className="bg-[#1a1a1a] border-b border-white/5 p-4 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gaia-yellow uppercase tracking-widest border border-gaia-yellow/20 px-2 py-1 rounded">
                        {match.escalao}
                    </span>
                    <span className="text-[10px] font-medium text-gray-500 uppercase">
                        {match.competicao}
                    </span>
                </div>

                {/* Scoreboard Area */}
                <div className="p-8 py-10 flex flex-col items-center justify-center relative bg-gradient-to-b from-[#111] to-black">

                    {/* Teams Row */}
                    <div className="flex w-full justify-between items-start gap-4">

                        {/* Home */}
                        <div className="flex-1 flex flex-col items-center text-center gap-3">
                            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center p-2 overflow-hidden">
                                {match.logotipo_casa ? (
                                    <img src={match.logotipo_casa} alt={match.equipa_casa} className="w-full h-full object-contain" />
                                ) : (
                                    <Shield className="text-gray-600" size={32} />
                                )}
                            </div>
                            <h2 className="text-lg font-bold text-white leading-tight">
                                {match.equipa_casa}
                            </h2>
                        </div>

                        {/* Center Info */}
                        <div className="flex flex-col items-center gap-2 pt-4">
                            {match.status === 'A DECORRER' && (
                                <span className="bg-red-500 text-white px-2 py-0.5 rounded text-[10px] font-bold animate-pulse">
                                    LIVE
                                </span>
                            )}
                            <div className="text-xs font-mono text-gray-500">
                                {isFinished ? 'FINAL' : 'VS'}
                            </div>
                        </div>

                        {/* Away */}
                        <div className="flex-1 flex flex-col items-center text-center gap-3">
                            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center p-2 overflow-hidden">
                                {match.logotipo_fora ? (
                                    <img src={match.logotipo_fora} alt={match.equipa_fora} className="w-full h-full object-contain" />
                                ) : (
                                    <Shield className="text-gray-600" size={32} />
                                )}
                            </div>
                            <h2 className="text-lg font-bold text-white leading-tight">
                                {match.equipa_fora}
                            </h2>
                        </div>
                    </div>

                    {/* Big Score */}
                    <div className="mt-8 flex items-center justify-center gap-8">
                        <div className={`text-5xl font-mono font-bold tracking-tighter ${isFinished || match.status === 'A DECORRER' ? 'text-white' : 'text-gray-700'}`}>
                            {match.resultado_casa ?? '-'}
                        </div>
                        <div className="text-gray-700 text-2xl font-light">:</div>
                        <div className={`text-5xl font-mono font-bold tracking-tighter ${isFinished || match.status === 'A DECORRER' ? 'text-white' : 'text-gray-700'}`}>
                            {match.resultado_fora ?? '-'}
                        </div>
                    </div>

                </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 gap-3">

                {/* Location Tile */}
                <div className="glass-card p-5 flex items-start gap-4 hover:bg-white/5 transition-colors group">
                    <div className="p-3 rounded-full bg-white/5 text-gaia-yellow group-hover:scale-110 transition-transform">
                        <MapPin size={20} />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Localização</h4>
                        {match.local ? (
                            <div>
                                <p className="text-sm font-medium text-white mb-2">{match.local}</p>
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(match.local)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-bold text-gaia-yellow hover:text-white transition-colors border-b border-gaia-yellow/30 pb-0.5"
                                >
                                    Abrir no Mapa
                                </a>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-600 italic">Localização a definir</p>
                        )}
                    </div>
                </div>

                {/* Date/Time Tile */}
                <div className="glass-card p-5 flex items-center gap-4 hover:bg-white/5 transition-colors">
                    <div className="p-3 rounded-full bg-white/5 text-gaia-yellow">
                        <Calendar size={20} />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Data e Hora</h4>
                        <p className="text-sm font-medium text-white capitalize">{dateFormatted}</p>
                        <p className="text-sm text-gray-400 font-mono mt-0.5">{(match.hora || '00:00')}</p>
                    </div>
                </div>

            </div>

            {/* Footer Action */}
            <div className="mt-8 text-center">
                <button className="text-gray-600 hover:text-white transition-colors flex items-center gap-2 mx-auto text-sm font-medium">
                    <Share2 size={16} />
                    Partilhar Jogo
                </button>
            </div>

        </div>
    )
}

export default Game
