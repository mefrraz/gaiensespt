import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { Calendar, Trophy, Filter, Loader2 } from 'lucide-react'

// Types
type Match = {
    slug: string
    data: string
    hora: string
    equipa_casa: string
    equipa_fora: string
    resultado_casa: number | null
    resultado_fora: number | null
    escalao: string
    competicao: string
    status: 'AGENDADO' | 'A DECORRER' | 'FINALIZADO'
}

function App() {
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
            .order('data', { ascending: view === 'agenda' }) // Agenda: soonest first. Results: latest first? Actually results usually latest first.

        if (error) console.error('Error fetching:', error)
        else {
            // Sort logic refinement if needed
            let sorted = data as Match[]
            if (view === 'results') {
                // Sort results by date descending (most recent first)
                sorted = sorted.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
            }
            setMatches(sorted)

            // Extract unique escaloes
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
            .on('postgres_changes', { event: '*', schema: 'public', table: 'partidas' }, (payload) => {
                console.log('Change received!', payload)
                fetchMatches() // Re-fetch on any change
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [view]) // Refetch when view changes to re-sort (or handle sort client side)

    // Filter logic
    const filteredMatches = matches.filter(match => {
        // 1. View Filter
        if (view === 'agenda') {
            if (match.status === 'FINALIZADO') return false
        } else {
            if (match.status !== 'FINALIZADO') return false
        }

        // 2. Escalão Filter
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
        <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-white/10 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            FC Gaia Basquetebol
                        </h1>
                        <p className="text-gray-400 mt-1">Ecossistema de Resultados</p>
                    </div>

                    {/* View Toggles */}
                    <div className="flex bg-white/5 p-1 rounded-lg">
                        <button
                            onClick={() => setView('agenda')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${view === 'agenda' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <Calendar size={18} />
                            Agenda
                        </button>
                        <button
                            onClick={() => setView('results')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${view === 'results' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <Trophy size={18} />
                            Resultados
                        </button>
                    </div>
                </header>

                {/* Filters */}
                <div className="flex justify-end">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <Filter size={16} />
                        </div>
                        <select
                            value={filterEscalao}
                            onChange={(e) => setFilterEscalao(e.target.value)}
                            className="bg-white/5 border border-white/10 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 appearance-none cursor-pointer hover:bg-white/10 transition-colors"
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
                        <Loader2 className="animate-spin text-blue-500" size={48} />
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
                                    <h3 className="text-xl font-semibold text-blue-400 mb-4 capitalize">
                                        {formatDate(date)}
                                    </h3>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {groupedMatches[date].map(match => (
                                            <div key={match.slug} className="glass-card flex flex-col gap-3 relative overflow-hidden group">

                                                {/* Status Badge */}
                                                <div className="absolute top-0 right-0 p-3">
                                                    {match.status === 'A DECORRER' && (
                                                        <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full animate-pulse border border-red-500/50">
                                                            LIVE
                                                        </span>
                                                    )}
                                                    {match.status === 'FINALIZADO' && (
                                                        <span className="bg-gray-700/50 text-gray-400 text-xs px-2 py-1 rounded-full border border-white/5">
                                                            FINAL
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex justify-between items-start">
                                                    <span className="text-xs font-mono text-gray-500 border border-white/10 px-2 py-0.5 rounded">
                                                        {match.hora.slice(0, 5)}
                                                    </span>
                                                    <span className="text-xs text-blue-300 font-medium">
                                                        {match.escalao}
                                                    </span>
                                                </div>

                                                <div className="mt-2 flex justify-between items-center">
                                                    {/* Home Team */}
                                                    <div className={`flex flex-col w-1/3 ${match.resultado_casa !== null && match.resultado_fora !== null && match.resultado_casa > match.resultado_fora ? 'text-white font-bold' : 'text-gray-300'}`}>
                                                        <span className="truncate" title={match.equipa_casa}>{match.equipa_casa}</span>
                                                        {match.resultado_casa !== null && (
                                                            <span className="text-2xl mt-1 font-mono">{match.resultado_casa}</span>
                                                        )}
                                                    </div>

                                                    {/* VS / Dash */}
                                                    <div className="text-gray-600 text-sm font-light">
                                                        VS
                                                    </div>

                                                    {/* Away Team */}
                                                    <div className={`flex flex-col w-1/3 items-end text-right ${match.resultado_casa !== null && match.resultado_fora !== null && match.resultado_fora > match.resultado_casa ? 'text-white font-bold' : 'text-gray-300'}`}>
                                                        <span className="truncate" title={match.equipa_fora}>{match.equipa_fora}</span>
                                                        {match.resultado_fora !== null && (
                                                            <span className="text-2xl mt-1 font-mono">{match.resultado_fora}</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-2 text-xs text-center text-gray-600 truncate">
                                                    {match.competicao}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default App
