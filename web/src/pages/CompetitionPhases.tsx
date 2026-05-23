import { useState, useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Loader2, ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useStandings } from '../hooks/useStandings'
import { StandingsTable } from '../components/StandingsTable'
import { Standing } from '../components/types'

export default function CompetitionPhases() {
    const { associationId, competitionId } = useParams<{ associationId: string; competitionId: string }>()
    const assocId = parseInt(associationId || '0')
    const compId = parseInt(competitionId || '0')
    const season = '2025/2026'

    const [compName, setCompName] = useState('')
    const [assocName, setAssocName] = useState('')
    const [showLoadingMsg, setShowLoadingMsg] = useState(false)

    const { standings, loading, error } = useStandings(season, compId || null)

    useEffect(() => {
        if (!compId) return
        supabase.from('competitions')
            .select('competition_name, association_name')
            .eq('competition_id', compId).eq('season', season).single()
            .then(({ data }) => {
                if (data) {
                    setCompName(data.competition_name as string)
                    setAssocName(data.association_name as string)
                }
            })
    }, [compId])

    useEffect(() => {
        setShowLoadingMsg(false)
        if (!loading) return
        const t = setTimeout(() => setShowLoadingMsg(true), 1500)
        return () => clearTimeout(t)
    }, [loading])

    const getStatus = (teams: Standing[]): 'active' | 'finished' => {
        if (!teams.length) return 'finished'
        return teams.every(t => t.is_finished === true) ? 'finished' : 'active'
    }

    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
    const groups = useMemo(() => [...new Set(standings.map(s => s.grupo))].sort((a, b) => b.localeCompare(a)), [standings])
    const toggleGroup = (g: string) => setOpenGroups(p => ({ ...p, [g]: !p[g] }))
    const isOpen = (g: string) => openGroups[g] ?? false

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-[#09090b] dark:via-zinc-950 dark:to-[#09090b]">
            <div className="max-w-4xl mx-auto px-3 sm:px-5 pt-6 sm:pt-8 pb-16">
                <Link to={`/standings/${assocId}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors mb-4 group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                    {assocName || 'Competições'}
                </Link>

                <div className="mb-6">
                    <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight line-clamp-2">
                        {compName || 'Competição'}
                    </h1>
                    {assocName && (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mt-1">
                            {assocName} · {season}
                        </p>
                    )}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <Loader2 className="animate-spin text-violet-600" size={32} />
                        <span className={`text-sm text-zinc-400 font-medium transition-opacity duration-600 ${showLoadingMsg ? 'opacity-100' : 'opacity-0'}`}>
                            A atualizar classificações...
                        </span>
                    </div>
                ) : error ? (
                    <div className="text-center py-20 bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60">
                        <p className="text-zinc-500 font-medium">{error}</p>
                    </div>
                ) : groups.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60">
                        <p className="text-zinc-400 font-medium">Sem classificações disponíveis.</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-3 mb-10">
                            {groups.map(g => {
                                const t = standings.filter(s => s.grupo === g)
                                return <StandingsTable key={g} grupo={g} teams={t} isOpen={isOpen(g)} onToggle={() => toggleGroup(g)} status={getStatus(t)} />
                            })}
                        </div>
                        <div className="text-center border-t border-zinc-200 dark:border-zinc-800 pt-6">
                            <div className="inline-flex flex-wrap gap-4 text-[10px] font-medium text-zinc-400 justify-center">
                                <span><span className="font-bold text-zinc-500 dark:text-zinc-300">Pts</span> · Pontos</span>
                                <span><span className="font-bold text-zinc-500 dark:text-zinc-300">J</span> · Jogos</span>
                                <span><span className="font-bold text-zinc-500 dark:text-zinc-300">V</span> · Vitórias</span>
                                <span><span className="font-bold text-zinc-500 dark:text-zinc-300">D</span> · Derrotas</span>
                            </div>
                        </div>
                    </>
                )}
            </div>
            <style>{`.duration-600{transition-duration:600ms}.line-clamp-2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}`}</style>
        </div>
    )
}
