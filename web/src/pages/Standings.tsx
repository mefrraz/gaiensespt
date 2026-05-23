import { useState, useEffect, useMemo } from 'react'
import { ChevronDown, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StandingsTable } from '../components/StandingsTable'
import { useStandings } from '../hooks/useStandings'
import { Standing } from '../components/types'

const SEASONS = ['2025/2026', '2024/2025', '2023/2024', '2022/2023']

export default function Standings() {
    const [season, setSeason] = useState('2025/2026')
    const [competition, setCompetition] = useState('')
    const [phase, setPhase] = useState('Todas')
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
    const [showLoadingMessage, setShowLoadingMessage] = useState(false)

    const { standings, loading, error, refresh } = useStandings(season)

    useEffect(() => {
        if (!loading) {
            setShowLoadingMessage(false)
            return
        }
        const timer = setTimeout(() => setShowLoadingMessage(true), 1500)
        return () => clearTimeout(timer)
    }, [loading])

    useEffect(() => {
        setCompetition('')
        setPhase('Todas')
        setOpenGroups({})
    }, [season])

    useEffect(() => {
        if (standings.length > 0 && !competition) {
            const comps = [...new Set(standings.map(s => s.competicao))].sort()
            setCompetition(comps[0] || '')
        }
    }, [standings, competition])

    const competitions = useMemo(
        () => [...new Set(standings.map(s => s.competicao))].sort(),
        [standings]
    )

    const byCompetition = useMemo(
        () => standings.filter(s => s.competicao === competition),
        [standings, competition]
    )

    const phases = useMemo(
        () => [...new Set(byCompetition.map(s => s.grupo))].sort().reverse(),
        [byCompetition]
    )

    const getStatus = (teams: Standing[]): 'active' | 'finished' => {
        if (season !== '2025/2026') return 'finished'
        if (teams.length === 0) return 'finished'
        const allFinished = teams.every(t => t.is_finished === true)
        return allFinished ? 'finished' : 'active'
    }

    const filtered = phase === 'Todas' ? byCompetition : byCompetition.filter(s => s.grupo === phase)
    const groups = [...new Set(filtered.map(s => s.grupo))].sort((a, b) => b.localeCompare(a))

    const toggleGroup = (grupo: string) => setOpenGroups(prev => ({ ...prev, [grupo]: !prev[grupo] }))
    const isOpen = (grupo: string) => openGroups[grupo] !== false

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] animate-fadeIn pb-12 pt-16 px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-6">
                    <div>
                        <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight mb-2">Classificações</h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Consulte as tabelas e resultados de todas as equipas.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <select
                                value={season}
                                onChange={e => setSeason(e.target.value)}
                                className="appearance-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 pr-8 text-sm font-bold text-zinc-900 dark:text-white cursor-pointer hover:border-amber-500/50 dark:hover:border-amber-500/50 transition-colors shadow-sm"
                            >
                                {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                        </div>
                        <Link
                            to="/"
                            className="hidden md:flex items-center justify-center px-4 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700"
                        >
                            <span className="mr-2">←</span> Voltar
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-3 mb-6">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Competição</label>
                            <div className="relative">
                                <select
                                    value={competition}
                                    onChange={e => { setCompetition(e.target.value); setPhase('Todas'); setOpenGroups({}) }}
                                    className="w-full appearance-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-sm font-bold text-zinc-900 dark:text-white cursor-pointer focus:border-amber-500 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all shadow-sm disabled:opacity-50"
                                    disabled={loading || competitions.length === 0}
                                >
                                    {loading ? <option>A carregar...</option> : competitions.map(c => <option key={c} value={c}>{c}</option>)}
                                    {!loading && competitions.length === 0 && <option>Sem competições</option>}
                                </select>
                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Fase</label>
                            <div className="relative">
                                <select
                                    value={phase}
                                    onChange={e => setPhase(e.target.value)}
                                    className="w-full appearance-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-sm font-bold text-zinc-900 dark:text-white cursor-pointer focus:border-amber-500 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all shadow-sm disabled:opacity-50"
                                    disabled={loading || phases.length === 0}
                                >
                                    <option value="Todas">Todas as Fases</option>
                                    {phases.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="animate-spin text-amber-500" size={32} />
                        <span
                            className={`text-sm text-zinc-400 font-medium transition-opacity duration-600 ${
                                showLoadingMessage ? 'opacity-100' : 'opacity-0'
                            }`}
                        >
                            A atualizar classificações...
                        </span>
                    </div>
                ) : error && standings.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <p className="text-zinc-500 font-medium mb-2">Erro ao carregar classificações</p>
                        <button
                            onClick={() => refresh()}
                            className="text-sm font-bold text-amber-600 hover:text-amber-700 transition-colors"
                        >
                            Tentar novamente
                        </button>
                    </div>
                ) : groups.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <p className="text-zinc-500 font-medium">Não foram encontrados resultados para esta seleção.</p>
                    </div>
                ) : (
                    <div className="space-y-4 mb-8">
                        {groups.map(grupo => {
                            const teams = filtered.filter(s => s.grupo === grupo)
                            return (
                                <StandingsTable
                                    key={grupo}
                                    grupo={grupo}
                                    teams={teams}
                                    isOpen={isOpen(grupo)}
                                    onToggle={() => toggleGroup(grupo)}
                                    status={getStatus(teams)}
                                />
                            )
                        })}
                    </div>
                )}

                {/* Legend */}
                <div className="flex flex-wrap gap-4 text-[10px] font-medium text-zinc-500 dark:text-zinc-400 px-1">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-3 pr-4 border-r border-zinc-200 dark:border-zinc-800">
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-green-500 shadow-sm shadow-green-500/50" /> Zona de Subida</span>
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-red-500 shadow-sm shadow-red-500/50" /> Zona de Descida</span>
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-amber-500 shadow-sm shadow-amber-500/50" /> FC Gaia</span>
                        </div>
                        <div className="flex gap-3 text-zinc-400">
                            <span><span className="font-bold text-zinc-500 dark:text-zinc-300">Pts</span>: Pontos</span>
                            <span><span className="font-bold text-zinc-500 dark:text-zinc-300">J</span>: Jogos</span>
                            <span><span className="font-bold text-zinc-500 dark:text-zinc-300">V</span>: Vitórias</span>
                            <span><span className="font-bold text-zinc-500 dark:text-zinc-300">D</span>: Derrotas</span>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
                .duration-600 { transition-duration: 600ms; }
            `}</style>
        </div>
    )
}
