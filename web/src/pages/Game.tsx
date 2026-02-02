import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, MapPin, Calendar, Loader2, Share2, Shield, CalendarPlus } from 'lucide-react'
import { Match } from './Home'

function Game() {
    const { slug } = useParams()
    const [match, setMatch] = useState<Match | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchMatch = async () => {
            if (!slug) return
            setLoading(true)

            // Deduce season table from slug date YYYY-MM-DD
            // If date is >= August, it belongs to Season YYYY/(YYYY+1)
            // If date is < August, it belongs to Season (YYYY-1)/YYYY

            // Slug format: YYYY-MM-DD-home-away... or just YYYY-MM-DD
            // Extract the date part
            const datePart = slug.substring(0, 10) // "2023-10-05"
            // Simple validation that it looks like a date
            if (!/^\d{4}-\d{2}-\d{2}/.test(datePart)) {
                // Fallback to searching all or just current
                // Let's try current first
                console.warn("Could not determine date from slug, trying current season")
            }

            const year = parseInt(datePart.substring(0, 4))
            const month = parseInt(datePart.substring(5, 7))

            let tableName = 'partidas_2025_2026' // default

            if (year === 2023) {
                if (month >= 8) tableName = 'partidas_2023_2024'
                else tableName = 'partidas_2022_2023' // Not supported, maybe 2023/2024 leg?
                // Actually 2023-01 to 2023-07 is 2022/2023, which we don't have.
                // But 2023-09 is 2023/2024.
            } else if (year === 2024) {
                if (month >= 8) tableName = 'partidas_2024_2025'
                else tableName = 'partidas_2023_2024'
            } else if (year === 2025) {
                if (month >= 8) tableName = 'partidas_2025_2026'
                else tableName = 'partidas_2024_2025'
            } else if (year === 2026) {
                if (month < 8) tableName = 'partidas_2025_2026'
            }

            // Quick check if we have this table supported
            const SUPPORTED = ['partidas_2023_2024', 'partidas_2024_2025', 'partidas_2025_2026']
            if (!SUPPORTED.includes(tableName)) {
                // If we calculated something outside range, fallback to searching all?
                // Or just try the closest.
                tableName = 'partidas_2025_2026'
            }

            // Try fetching from calculated table
            let { data, error } = await supabase
                .from(tableName as any)
                .select('*')
                .eq('slug', slug)
                .single()

            // If not found, maybe our date logic was off or slug format is different?
            // Optional: Backup search if data is null
            if (!data && !error) {
                // Try 2025_2026
                const res = await supabase.from('partidas_2025_2026').select('*').eq('slug', slug).single()
                if (res.data) data = res.data
            }

            if (error && !data) console.error(error)
            else setMatch(data as Match)
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

    // Google Calendar Link Generator
    const generateGoogleCalendarLink = () => {
        if (!match.data || !match.hora) return '#'

        const [hours, minutes] = match.hora.split(':')
        const startDate = new Date(match.data)
        startDate.setHours(parseInt(hours), parseInt(minutes))

        const endDate = new Date(startDate.getTime() + 90 * 60000) // Assumes 1h30m duration

        const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "")

        const title = `Jogo: ${match.equipa_casa} vs ${match.equipa_fora}`
        const details = `Competição: ${match.competicao}\nEscalão: ${match.escalao}\n\nAcompanha em Gaienses App.`
        const location = match.local || 'Local a definir'

        return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}&sf=true&output=xml`
    }

    return (
        <div className="max-w-xl mx-auto pb-12">

            {/* Nav */}
            <div className="flex items-center justify-between mb-6">
                <Link to="/" className="p-2 -ml-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <div className="text-xs font-bold tracking-widest uppercase text-gray-500">
                    MATCH CENTER
                </div>
                <div className="w-10"></div> {/* Spacer */}
            </div>

            {/* Match Card - Adaptive Light/Dark */}
            <div className="glass-card p-0 overflow-hidden mb-6">

                {/* Competition Header */}
                <div className="bg-gray-50 dark:bg-[#1a1a1a] border-b border-gray-100 dark:border-white/5 p-4 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gaia-yellow uppercase tracking-widest border border-gaia-yellow/20 px-2 py-1 rounded">
                        {match.escalao}
                    </span>
                    <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase">
                        {match.competicao}
                    </span>
                </div>

                {/* Scoreboard Area */}
                <div className="p-8 py-10 flex flex-col items-center justify-center relative bg-gradient-to-b from-white to-gray-50 dark:from-[#111] dark:to-black">

                    {/* Teams Row */}
                    <div className="flex w-full justify-between items-start gap-4">

                        {/* Home */}
                        <div className="flex-1 flex flex-col items-center text-center gap-3">
                            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center p-2 overflow-hidden">
                                {match.logotipo_casa ? (
                                    <img src={match.logotipo_casa} alt={match.equipa_casa} className="w-full h-full object-contain" />
                                ) : (
                                    <Shield className="text-gray-400 dark:text-gray-600" size={32} />
                                )}
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
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
                            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center p-2 overflow-hidden">
                                {match.logotipo_fora ? (
                                    <img src={match.logotipo_fora} alt={match.equipa_fora} className="w-full h-full object-contain" />
                                ) : (
                                    <Shield className="text-gray-400 dark:text-gray-600" size={32} />
                                )}
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                                {match.equipa_fora}
                            </h2>
                        </div>
                    </div>

                    {/* Big Score */}
                    <div className="mt-8 flex items-center justify-center gap-8">
                        <div className={`text-5xl font-mono font-bold tracking-tighter ${isFinished || match.status === 'A DECORRER' ? 'text-gray-900 dark:text-white' : 'text-gray-300 dark:text-gray-700'}`}>
                            {match.resultado_casa ?? '-'}
                        </div>
                        <div className="text-gray-300 dark:text-gray-700 text-2xl font-light">:</div>
                        <div className={`text-5xl font-mono font-bold tracking-tighter ${isFinished || match.status === 'A DECORRER' ? 'text-gray-900 dark:text-white' : 'text-gray-300 dark:text-gray-700'}`}>
                            {match.resultado_fora ?? '-'}
                        </div>
                    </div>

                </div>
            </div>


            {/* Info Grid - Adaptive Light/Dark */}
            <div className="grid grid-cols-1 gap-3">

                {/* Location Tile */}
                {/* Location Tile */}
                <div className="glass-card p-0 overflow-hidden hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group flex flex-col">
                    {match.local ? (
                        <div className="w-full h-48 relative">
                            {/* Use standard Google Maps Embed (Search mode) which often works without specific Place API restrictions or use query param mode */}
                            <iframe
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                loading="lazy"
                                allowFullScreen
                                src={`https://maps.google.com/maps?q=${encodeURIComponent(match.local)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                            ></iframe>
                            <div className="absolute inset-0 pointer-events-none border-b border-gray-200 dark:border-white/10" />
                        </div>
                    ) : null}

                    <div className="p-5 flex items-start gap-4">
                        <div className="p-3 rounded-full bg-gray-100 dark:bg-white/5 text-gaia-yellow group-hover:scale-110 transition-transform">
                            <MapPin size={20} />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Localização</h4>
                            {match.local ? (
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">{match.local}</p>
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(match.local)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs font-bold bg-zinc-100 dark:bg-white/10 px-3 py-1.5 rounded-full hover:bg-gaia-yellow hover:text-black transition-colors"
                                    >
                                        <MapPin size={12} />
                                        Obter Direções
                                    </a>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-600 italic">Localização a definir</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Date/Time Tile */}
                <div className="glass-card p-5 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <div className="p-3 rounded-full bg-gray-100 dark:bg-white/5 text-gaia-yellow">
                        <Calendar size={20} />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Data e Hora</h4>
                        <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{dateFormatted}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-0.5">{(match.hora || '00:00')}</p>
                    </div>
                </div>

            </div>

            {/* Footer Actions: Share + Calendar */}
            <div className="mt-8 flex flex-col gap-3 items-center">

                {/* Add to Calendar (Only for AGENDADO) */}
                {match.status === 'AGENDADO' && match.hora && (
                    <a
                        href={generateGoogleCalendarLink()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full max-w-xs bg-gaia-yellow hover:bg-yellow-400 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-yellow-500/20"
                    >
                        <CalendarPlus size={18} />
                        Adicionar ao Calendário
                    </a>
                )}

                <button
                    onClick={() => {
                        if (navigator.share) {
                            navigator.share({
                                title: `FC Gaia vs ${match.equipa_fora}`,
                                text: `Confira o jogo do FC Gaia: ${match.equipa_casa} vs ${match.equipa_fora} no dia ${dateFormatted}!`,
                                url: window.location.href
                            })
                        } else {
                            // Fallback for desktop? clipboard
                            navigator.clipboard.writeText(window.location.href)
                            alert('Link copiado!')
                        }
                    }}
                    className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2 mx-auto text-sm font-medium py-2"
                >
                    <Share2 size={16} />
                    Partilhar Jogo
                </button>
            </div>

        </div>
    )
}

export default Game
