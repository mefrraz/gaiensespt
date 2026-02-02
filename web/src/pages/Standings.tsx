import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Trophy, ChevronRight, Loader2, Calendar, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

export interface Standing {
    id: string
    competicao: string
    grupo: string
    equipa: string
    posicao: number
    jogos: number
    vitorias: number
    derrotas: number
    pontos: number
}

function Standings() {
    const [standings, setStandings] = useState<Standing[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCompetition, setSelectedCompetition] = useState<string>('')

    const fetchStandings = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('classificacoes')
            .select('*')

        if (!error && data) {
            setStandings(data as Standing[])
            // Default to first competition if not set
            if (data.length > 0 && !selectedCompetition) {
                const comps = Array.from(new Set(data.map((s: Standing) => s.competicao))).sort()
                if (comps.length > 0) setSelectedCompetition(comps[0])
            }
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchStandings()
    }, [])

    // Extract unique Competitions
    const competitions = Array.from(new Set(standings.map(s => s.competicao))).sort()

    // Filter by Selected Competition
    const filteredStandings = standings.filter(s => s.competicao === selectedCompetition)

    // Group by Group Name
    const groupedStandings = filteredStandings.reduce((groups, team) => {
        const group = team.grupo
        if (!groups[group]) groups[group] = []
        groups[group].push(team)
        return groups
    }, {} as Record<string, Standing[]>)

    // Helper to check if it's a Gaia team for highlighting
    const isGaiaTeam = (name: string) => {
        return name.toUpperCase().includes('GAIA')
    }

    return (
        <div className="max-w-7xl mx-auto pb-20 px-4 md:px-8 py-8">
            <div className="flex flex-col md:flex-row gap-8">

                {/* Sidebar (Desktop) / Tabs (Mobile) */}
                <aside className="w-full md:w-64 flex-shrink-0">
                    <div className="sticky top-24 space-y-6">
                        <div className="flex items-center gap-3 md:mb-6">
                            <div className="w-10 h-10 bg-gaia-yellow rounded-xl flex items-center justify-center text-black shadow-lg shadow-yellow-500/20">
                                <Trophy size={20} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h1 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white">Classificações</h1>
                                <p className="text-[10px] md:text-xs text-zinc-500 font-medium uppercase tracking-wide">Época 2025/2026</p>
                            </div>
                        </div>

                        {/* Mobile Tabs */}
                        <div className="md:hidden overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                            <div className="flex gap-2">
                                {competitions.map(comp => (
                                    <button
                                        key={comp}
                                        onClick={() => setSelectedCompetition(comp)}
                                        className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold transition-all ${selectedCompetition === comp
                                            ? 'bg-gaia-yellow text-black shadow-md'
                                            : 'bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-100 dark:border-white/5'
                                            }`}
                                    >
                                        {comp.replace('Camp. Distrital ', '').replace('Camp. Nacional ', '')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Desktop Sidebar Menu */}
                        <nav className="hidden md:flex flex-col gap-1">
                            <h3 className="px-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Competições</h3>
                            {competitions.map(comp => (
                                <button
                                    key={comp}
                                    onClick={() => setSelectedCompetition(comp)}
                                    className={`text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-between group ${selectedCompetition === comp
                                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-lg'
                                        : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white'
                                        }`}
                                >
                                    <span className="truncate">{comp.replace('Camp. ', '')}</span>
                                    {selectedCompetition === comp && <ChevronRight size={14} />}
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    {loading ? (
                        <div className="flex justify-center py-32">
                            <Loader2 className="animate-spin text-gaia-yellow" size={32} />
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {Object.entries(groupedStandings).length === 0 ? (
                                <div className="text-center py-20 text-zinc-500 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-white/5">
                                    <Trophy size={48} className="mx-auto mb-4 text-zinc-200 dark:text-zinc-800" />
                                    <p className="font-medium">Selecione uma competição para ver a tabela.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {Object.entries(
                                        // Group by Phase first
                                        Object.entries(groupedStandings).reduce((phases, [grupo, teams]) => {
                                            const phaseName = grupo.split(' - ')[0] || 'Outros'
                                            if (!phases[phaseName]) phases[phaseName] = []
                                            phases[phaseName].push({ grupo, teams })
                                            return phases
                                        }, {} as Record<string, { grupo: string, teams: Standing[] }[]>)
                                    ).sort((a, b) => b[0].localeCompare(a[0])) // Sort phases descending (e.g. 2ª follows 1ª, but usually we want latest opened.
                                    // Better sort logic might be needed if "Fase Final" etc. For now localeCompare usually puts "2.ª" after "1.ª".
                                    // User wants "Last phase open, others closed".
                                    // If we sort descending, "3.ª" comes before "2.ª" (if string). Wait. "3" > "2".
                                    // So index 0 will be the "latest" phase.
                                ).map(([phaseName, groups], index) => (
                                    <div key={phaseName} className="space-y-4">
                                        <details className="group" open={index === 0}>
                                            <summary className="list-none cursor-pointer">
                                                <div className="flex items-center justify-between mb-4 bg-zinc-100 dark:bg-white/5 p-4 rounded-xl hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors">
                                                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                                        <span className="w-2 h-8 bg-gaia-yellow rounded-full"></span>
                                                        {phaseName}
                                                    </h2>
                                                    <ChevronRight className="transform transition-transform group-open:rotate-90 text-zinc-400" />
                                                </div>
                                            </summary>

                                            <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                                                {groups.map(({ grupo, teams }) => (
                                                    <div key={grupo} className="glass-card overflow-hidden">
                                                        <div className="bg-gradient-to-r from-zinc-50 to-white dark:from-white/5 dark:to-zinc-900/50 p-6 border-b border-zinc-100 dark:border-white/5 flex justify-between items-center">
                                                            <div>
                                                                <span className="text-[10px] font-bold text-gaia-yellow uppercase tracking-wider block mb-1">
                                                                    {selectedCompetition}
                                                                </span>
                                                                <h3 className="text-base font-bold text-zinc-900 dark:text-white">{grupo}</h3>
                                                            </div>
                                                            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-zinc-400 bg-white dark:bg-black/20 px-3 py-1.5 rounded-full border border-zinc-100 dark:border-white/5">
                                                                <Calendar size={12} />
                                                                2025/2026
                                                            </div>
                                                        </div>

                                                        <div className="overflow-x-auto">
                                                            <table className="w-full text-sm text-left">
                                                                <thead className="text-xs text-zinc-400 uppercase bg-zinc-50/50 dark:bg-white/5 border-b border-zinc-100 dark:border-white/5">
                                                                    <tr>
                                                                        <th className="px-6 py-4 font-bold text-center w-16">#</th>
                                                                        <th className="px-6 py-4 font-bold">Equipa</th>
                                                                        <th className="px-4 py-4 font-bold text-center w-14">J</th>
                                                                        <th className="px-4 py-4 font-bold text-center w-14">V</th>
                                                                        <th className="px-4 py-4 font-bold text-center w-14">D</th>
                                                                        <th className="px-6 py-4 font-bold text-center w-16 text-zinc-900 dark:text-white">PTS</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                                                                    {teams.sort((a, b) => a.posicao - b.posicao).map((team) => {
                                                                        const isGaia = isGaiaTeam(team.equipa)
                                                                        return (
                                                                            <tr
                                                                                key={team.equipa}
                                                                                className={`transition-colors relative overflow-hidden group ${isGaia
                                                                                    ? 'bg-gaia-yellow/10 hover:bg-gaia-yellow/20'
                                                                                    : 'hover:bg-zinc-50 dark:hover:bg-white/5 even:bg-zinc-50/30 dark:even:bg-white/[0.02]'
                                                                                    }`}
                                                                            >
                                                                                <td className="px-6 py-4 text-center">
                                                                                    <span className={`inline-flex w-7 h-7 items-center justify-center rounded-lg text-xs font-bold leading-none ${team.posicao <= 2
                                                                                        ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 ring-1 ring-green-500/20'
                                                                                        : team.posicao >= teams.length - 1
                                                                                            ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 ring-1 ring-red-500/20'
                                                                                            : 'bg-zinc-100 dark:bg-white/10 text-zinc-500'
                                                                                        }`}>
                                                                                        {team.posicao}
                                                                                    </span>
                                                                                </td>
                                                                                <td className="px-6 py-4">
                                                                                    <div className="flex items-center gap-3">
                                                                                        {isGaia && (
                                                                                            <div className="w-1.5 h-1.5 rounded-full bg-gaia-yellow shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
                                                                                        )}
                                                                                        <span className={`font-bold ${isGaia ? 'text-zinc-900 dark:text-white text-base' : 'text-zinc-600 dark:text-zinc-300'}`}>
                                                                                            {team.equipa}
                                                                                        </span>
                                                                                    </div>
                                                                                </td>
                                                                                <td className="px-4 py-4 text-center font-medium text-zinc-500">{team.jogos}</td>
                                                                                <td className="px-4 py-4 text-center font-bold text-green-600 dark:text-green-400 bg-green-50/50 dark:bg-green-500/5 rounded-lg my-1">{team.vitorias}</td>
                                                                                <td className="px-4 py-4 text-center font-medium text-red-500 dark:text-red-400 bg-red-50/50 dark:bg-red-500/5 rounded-lg my-1">{team.derrotas}</td>
                                                                                <td className="px-6 py-4 text-center">
                                                                                    <span className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">{team.pontos}</span>
                                                                                </td>
                                                                            </tr>
                                                                        )
                                                                    })}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </details>
                                    </div>
                                ))}
                                </div>
                            )
                            }
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}

export default Standings
