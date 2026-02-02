import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Trophy, ChevronRight, Loader2 } from 'lucide-react'

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
    const [filterPhase, setFilterPhase] = useState<string>('Todas')
    const [filterTeam, setFilterTeam] = useState<string>('Todos')
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

    const fetchStandings = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('classificacoes')
            .select('*')

        if (!error && data) {
            setStandings(data as Standing[])
            // Expand all by default for better visibility on a dedicated page
            const allGroups: Record<string, boolean> = {}
            data.forEach((s: Standing) => allGroups[s.grupo] = true)
            setExpandedGroups(allGroups)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchStandings()
    }, [])

    // Extract unique phases
    const phases = Array.from(new Set(standings.map(s => {
        const parts = s.grupo.split(' - ')
        return parts[0] || 'Outra'
    }))).sort()

    // Extract unique Gaia teams
    const gaiaTeams = Array.from(new Set(standings
        .filter(s => {
            const name = s.equipa.toUpperCase()
            return name.startsWith('SUB') || name.startsWith('SENIORES') || name.includes('GAIA')
        })
        .map(s => s.equipa)
    )).sort()

    // Filter Logic
    const filteredStandings = standings.filter(team => {
        if (filterPhase !== 'Todas') {
            const teamPhase = team.grupo.split(' - ')[0] || ''
            if (teamPhase !== filterPhase) return false
        }
        if (filterTeam !== 'Todos') {
            const groupHasSelectedTeam = standings.some(
                s => s.grupo === team.grupo && s.equipa === filterTeam
            )
            if (!groupHasSelectedTeam) return false
        }
        return true
    })

    // Group by Group Name
    const groupedStandings = filteredStandings.reduce((groups, team) => {
        const group = team.grupo
        if (!groups[group]) groups[group] = []
        groups[group].push(team)
        return groups
    }, {} as Record<string, Standing[]>)

    const toggleGroup = (group: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [group]: !prev[group]
        }))
    }

    return (
        <div className="max-w-4xl mx-auto pb-20 px-4 pt-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gaia-yellow rounded-xl flex items-center justify-center text-black shadow-lg shadow-yellow-500/20">
                    <Trophy size={20} strokeWidth={2.5} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Classificações</h1>
                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Temporada 2024/2025</p>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 mb-6 space-y-4">
                <div className="flex flex-wrap gap-3">
                    <div className="flex-1 min-w-[140px]">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Fase</label>
                        <select
                            value={filterPhase}
                            onChange={(e) => setFilterPhase(e.target.value)}
                            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-zinc-800 dark:text-zinc-300 text-xs font-medium rounded-lg focus:ring-1 focus:ring-gaia-yellow focus:border-gaia-yellow block w-full p-2.5 shadow-sm"
                        >
                            <option value="Todas">Todas as Fases</option>
                            {phases.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div className="flex-1 min-w-[140px]">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Equipa Gaia</label>
                        <select
                            value={filterTeam}
                            onChange={(e) => setFilterTeam(e.target.value)}
                            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-zinc-800 dark:text-zinc-300 text-xs font-medium rounded-lg focus:ring-1 focus:ring-gaia-yellow focus:border-gaia-yellow block w-full p-2.5 shadow-sm"
                        >
                            <option value="Todos">Todas as Equipas</option>
                            {gaiaTeams.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-gaia-yellow" size={32} />
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedStandings).length === 0 ? (
                        <div className="text-center py-20 text-zinc-500">
                            Nenhuma classificação encontrada.
                        </div>
                    ) : (
                        Object.entries(groupedStandings).map(([grupo, teams]) => (
                            <div key={grupo} className="glass-card overflow-hidden">
                                <button
                                    onClick={() => toggleGroup(grupo)}
                                    className="w-full bg-zinc-50 dark:bg-white/5 p-4 border-b border-zinc-100 dark:border-white/5 flex justify-between items-center"
                                >
                                    <div className="text-left">
                                        <span className="text-[10px] font-bold text-gaia-yellow uppercase tracking-wider block">
                                            {teams[0]?.competicao.replace('Camp. Distrital ', '') || ''}
                                        </span>
                                        <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{grupo}</h3>
                                    </div>
                                    <ChevronRight
                                        size={16}
                                        className={`text-zinc-400 transition-transform duration-300 ${expandedGroups[grupo] ? 'rotate-90' : ''}`}
                                    />
                                </button>

                                <div className={`transition-all duration-300 ${expandedGroups[grupo] ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="text-xs text-zinc-500 bg-zinc-50/50 dark:bg-white/5 uppercase border-b border-zinc-100 dark:border-white/5">
                                                <tr>
                                                    <th className="px-4 py-3 text-center w-12">#</th>
                                                    <th className="px-4 py-3 text-left">Equipa</th>
                                                    <th className="px-2 py-3 text-center w-10">J</th>
                                                    <th className="px-2 py-3 text-center w-10">V</th>
                                                    <th className="px-2 py-3 text-center w-10">D</th>
                                                    <th className="px-4 py-3 text-center w-14 font-bold">PTS</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                                                {teams.sort((a, b) => a.posicao - b.posicao).map((team) => (
                                                    <tr key={team.equipa} className={team.equipa.includes("GAIA") || team.equipa.startsWith("Sub") || team.equipa.startsWith("Seniores") ? "bg-gaia-yellow/5" : ""}>
                                                        <td className="px-4 py-3 text-center">
                                                            <span className={`inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-bold ${team.posicao <= 2 ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' :
                                                                'text-zinc-500'
                                                                }`}>
                                                                {team.posicao}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white">
                                                            {team.equipa}
                                                        </td>
                                                        <td className="px-2 py-3 text-center text-zinc-500">{team.jogos}</td>
                                                        <td className="px-2 py-3 text-center text-green-600 dark:text-green-400 font-medium">{team.vitorias}</td>
                                                        <td className="px-2 py-3 text-center text-red-500 dark:text-red-400 font-medium">{team.derrotas}</td>
                                                        <td className="px-4 py-3 text-center font-bold text-zinc-900 dark:text-white">{team.pontos}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}

export default Standings
