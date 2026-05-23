import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, ArrowRight } from 'lucide-react'
import { useClub } from '../lib/ClubContext'
import { supabase } from '../lib/supabase'

interface TeamInfo {
    competition_id: number
    competition_name: string
    club_count: number
    escalao: string
}

function extractEscalao(name: string): string {
    const u = name.toUpperCase()
    if (u.includes('SENIOR') || u.includes('SÉNIOR') || u.includes('1ª DIVISÃO') || u.includes('BETCLIC') || u.includes('PROLIGA')) return 'Séniores'
    if (u.includes('SUB18') || u.includes('SUB 18')) return 'Sub 18'
    if (u.includes('SUB16') || u.includes('SUB 16')) return 'Sub 16'
    if (u.includes('SUB14') || u.includes('SUB 14')) return 'Sub 14'
    if (u.includes('SUB12') || u.includes('SUB 12') || u.includes('MINI')) return 'Sub 12'
    if (u.includes('SUB20') || u.includes('SUB 20')) return 'Sub 20'
    return name
}

export default function ClubTeams() {
    const { clubName } = useClub()
    const [teams, setTeams] = useState<TeamInfo[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!clubName) return
        setLoading(true)
        supabase.from('competitions')
            .select('competition_id, competition_name, club_names')
            .eq('season', '2025/2026')
            .order('competition_name')
            .then(({ data }) => {
                if (data) {
                    const teams: TeamInfo[] = []
                    data.forEach(r => {
                        const names = (r.club_names as string[]) || []
                        if (names.some(n => n.toUpperCase().includes(clubName.toUpperCase()))) {
                            teams.push({
                                competition_id: r.competition_id as number,
                                competition_name: r.competition_name as string,
                                club_count: names.length,
                                escalao: extractEscalao(r.competition_name as string),
                            })
                        }
                    })
                    setTeams(teams)
                }
                setLoading(false)
            })
    }, [clubName])

    const grouped = teams.reduce((acc, t) => {
        if (!acc[t.escalao]) acc[t.escalao] = []
        acc[t.escalao].push(t)
        return acc
    }, {} as Record<string, TeamInfo[]>)

    return (
        <div className="max-w-xl mx-auto pb-24 px-3">
            <div className="mb-5 pt-2">
                <h1 className="text-xl font-black text-zinc-900 dark:text-white">Equipas</h1>
                <p className="text-xs text-zinc-500 mt-0.5">{clubName} · 2025/2026</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-amber-500" size={28} /></div>
            ) : teams.length === 0 ? (
                <div className="text-center py-20 text-zinc-400 font-medium">Nenhuma equipa encontrada.</div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(grouped).map(([escalao, comps]) => (
                        <div key={escalao}>
                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">{escalao}</h3>
                            <div className="space-y-2">
                                {comps.map(c => (
                                    <Link key={c.competition_id}
                                        to={`/standings/${c.competition_id}`.replace(/\/\d+$/, '') + '/' + c.competition_id}
                                        className="w-full text-left bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm hover:border-amber-500/40 transition-all flex items-center justify-between gap-3 group">
                                        <div className="min-w-0">
                                            <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{c.competition_name}</h4>
                                            <p className="text-[11px] text-zinc-400 mt-0.5">{c.club_count} equipas</p>
                                        </div>
                                        <ArrowRight size={14} className="text-zinc-400 group-hover:text-amber-500 shrink-0 transition-colors" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
