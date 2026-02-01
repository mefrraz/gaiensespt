import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Calendar, Trophy, Filter, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'

// Types
export type Match = {
    slug: string
    data: string
    hora: string
    equipa_casa: string
    equipa_fora: string
    resultado_casa: number | null
    resultado_fora: number | null
    escalao: string
    competicao: string
    local: string | null
    status: 'AGENDADO' | 'A DECORRER' | 'FINALIZADO'
}

function Home() {
    const [matches, setMatches] = useState<Match[]>([])
    const [loading, setLoading] = useState(true)
    const [view, setView] = useState<'agenda' | 'results'>('agenda')
    const [filterEscalao, setFilterEscalao] = useState<string>('Todos')
    const [escaloes, setEscaloes] = useState<string[]>([])

    // Fetch data
    const fetchMatches = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('partidas')
            .select('*')
            .order('data', { ascending: view === 'agenda' })

        if (error) console.error('Error fetching:', error)
        else {
            let sorted = data as Match[]
            if (view === 'results') {
                sorted = sorted.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
            }
            setMatches(sorted)

            const uniqueEscaloes = Array.from(new Set(sorted.map(m => m.escalao))).filter(Boolean).sort()
            setEscaloes(uniqueEscaloes)
        }
        setLoading(false)
    }

    // Initial fetch and Realtime subscription
    useEffect(() => {
        fetchMatches()

        const channel = supabase
            .channel('public:partidas')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'partidas' }, () => {
                fetchMatches() // Re-fetch on any change
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [view])

    // Filter logic
    const filteredMatches = matches.filter(match => {
        if (view === 'agenda') {
            if (match.status === 'FINALIZADO') return false
        } else {
            if (match.status !== 'FINALIZADO') return false
        }

        if (filterEscalao !== 'Todos' && match.escalao !== filterEscalao) return false
        return true
    })

    // Group by Date for cleaner UI
    const groupedMatches = filteredMatches.reduce((groups, match) => {
        const date = match.data
        if (!groups[date]) groups[date] = []
        groups[date].push(match)
        return groups
    }, {} as Record<string, Match[]>)

    // Sort dates
    const sortedDates = Object.keys(groupedMatches).sort((a, b) => {
        return view === 'agenda'
            ? new Date(a).getTime() - new Date(b).getTime()
            : new Date(b).getTime() - new Date(a).getTime()
    })

    // Format Date Helper
    const formatDate = (dateStr: string) => {
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' }
        return new Date(dateStr).toLocaleDateString('pt-PT', options)
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">

            {/* View Toggles & Filters */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 shadow-lg backdrop-blur-md">
                <div className="flex bg-gray-900/50 p-1 rounded-lg">
                    <button
                        onClick={() => setView('agenda')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all font-medium ${view === 'agenda' ? 'bg-gaia-yellow text-black shadow-lg shadow-gaia-yellow/20' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <Calendar size={18} />
                        Agenda
                    </button>
                    <button
                        onClick={() => setView('results')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all font-medium ${view === 'results' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <Trophy size={18} />
                        Resultados
                    </button>
                </div>

                <div className="relative group w-full md:w-auto">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Filter size={16} />
                    </div>
                    <select
                        value={filterEscalao}
                        onChange={(e) => setFilterEscalao(e.target.value)}
                        className="bg-gray-900/50 border border-white/10 text-white text-sm rounded-lg focus:ring-gaia-yellow focus:border-gaia-yellow block w-full md:w-64 pl-10 p-2.5 appearance-none cursor-pointer hover:bg-gray-800 transition-colors"
                    >
                        <option value="Todos">Todos os Escalões</option>
                        {escaloes.map(e => (
                            <option key={e} value={e}>{e}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-gaia-blue" size={48} />
                </div>
            ) : (
                <div className="space-y-8">
                    {sortedDates.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            Nenhum jogo encontrado.
                        </div>
                    ) : (
                        sortedDates.map(date => (
                            <div key={date} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h3 className="text-xl font-semibold text-white/90 mb-4 capitalize border-l-4 border-gaia-yellow pl-3">
                                    {formatDate(date)}
                                </h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {groupedMatches[date].map(match => (
                                        <Link to={`/game/${match.slug}`} key={match.slug} className="glass-card flex flex-col gap-3 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 hover:border-gaia-yellow/50 block bg-gray-900/40 border border-white/10 p-5 rounded-xl">

                                            {/* Status Badge */}
                                            <div className="absolute top-0 right-0 p-3 z-10">
                                                {match.status === 'A DECORRER' && (
                                                    <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full animate-pulse border border-red-500/50 font-bold">
                                                        LIVE
                                                    </span>
                                                )}
                                                {/* Removed FINAL status as requested */}
                                            </div>

                                            <div className="flex justify-between items-start">
                                                <span className="text-xs font-mono text-gray-400 bg-black/30 px-2 py-1 rounded">
                                                    {(match.hora || '00:00').slice(0, 5)}
                                                </span>
                                                <span className="text-xs text-gaia-yellow font-bold tracking-wider uppercase">
                                                    {match.escalao}
                                                </span>
                                            </div>

                                            <div className="mt-2 flex justify-between items-center relative z-0">
                                                {/* Home Team */}
                                                <div className={`flex flex-col w-1/3 ${match.resultado_casa !== null && match.resultado_fora !== null && match.resultado_casa > match.resultado_fora ? 'text-white font-bold' : 'text-gray-400'}`}>
                                                    <span className="truncate text-sm" title={match.equipa_casa}>{match.equipa_casa}</span>
                                                    {match.resultado_casa !== null && (
                                                        <span className="text-3xl mt-1 font-mono">{match.resultado_casa}</span>
                                                    )}
                                                </div>

                                                {/* VS / Dash */}
                                                <div className="text-gray-600 text-sm font-light">
                                                    VS
                                                </div>

                                                {/* Away Team */}
                                                <div className={`flex flex-col w-1/3 items-end text-right ${match.resultado_casa !== null && match.resultado_fora !== null && match.resultado_fora > match.resultado_casa ? 'text-white font-bold' : 'text-gray-400'}`}>
                                                    <span className="truncate text-sm" title={match.equipa_fora}>{match.equipa_fora}</span>
                                                    {match.resultado_fora !== null && (
                                                        <span className="text-3xl mt-1 font-mono">{match.resultado_fora}</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-3 pt-3 border-t border-white/5 text-xs text-center text-gray-500 truncate flex items-center justify-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-gaia-yellow"></span>
                                                {match.competicao}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}

export default Home
