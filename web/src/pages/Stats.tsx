import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { Loader2, TrendingUp, Trophy } from 'lucide-react'

// Types
type Match = {
    resultado_casa: number
    resultado_fora: number
    equipa_casa: string
    equipa_fora: string
    status: string
    data: string
    epoca: string
}

function Stats() {
    const [matches, setMatches] = useState<Match[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedSeason, setSelectedSeason] = useState<string>('all')
    const [seasons, setSeasons] = useState<string[]>([])

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('partidas')
            .select('*')
            .eq('status', 'FINALIZADO')

        if (data) {
            setMatches(data)
            // Extract unique seasons
            const uniqueSeasons = Array.from(new Set(data.map(m => m.epoca).filter(Boolean)))
            setSeasons(uniqueSeasons.sort().reverse())
            if (uniqueSeasons.length > 0) setSelectedSeason(uniqueSeasons[0]) // Default to latest
        }
        setLoading(false)
    }

    // Filter matches
    const filteredMatches = selectedSeason === 'all'
        ? matches
        : matches.filter(m => m.epoca === selectedSeason)

    // Calculate Stats
    // Assuming "FC Gaia" is always the team we care about. 
    // We need to identify which team is FC Gaia. Usually the name contains "Gaia".
    const isFCGaia = (name: string) => name.toUpperCase().includes('GAIA')

    let wins = 0
    let losses = 0
    let pointsScored = 0
    let pointsConceded = 0
    let biggestWin = { margin: 0, match: null as Match | null }

    filteredMatches.forEach(match => {
        const homeIsGaia = isFCGaia(match.equipa_casa)
        const gaiaScore = homeIsGaia ? match.resultado_casa : match.resultado_fora
        const oppScore = homeIsGaia ? match.resultado_fora : match.resultado_casa

        if (gaiaScore > oppScore) wins++
        else losses++

        pointsScored += gaiaScore
        pointsConceded += oppScore

        const margin = gaiaScore - oppScore
        if (margin > biggestWin.margin) {
            biggestWin = { margin, match }
        }
    })

    const winRateData = [
        { name: 'Vitórias', value: wins, color: '#F5B417' }, // Gaia Yellow
        { name: 'Derrotas', value: losses, color: '#27272a' }, // Zinc 800
    ]

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">

            {/* Header & Filter */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                        <TrendingUp className="text-gaia-yellow" />
                        Estatísticas
                    </h1>
                    <p className="text-sm text-zinc-500">Análise de performance do clube</p>
                </div>

                <select
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(e.target.value)}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-lg px-4 py-2 font-bold text-sm"
                >
                    {seasons.map(s => <option key={s} value={s}>{s}</option>)}
                    <option value="all">Todas as Épocas</option>
                </select>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Win/Loss Card */}
                    <div className="glass-card p-6 flex flex-col items-center justify-center min-h-[300px]">
                        <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">Taxa de Vitória</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={winRateData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {winRateData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="text-center mt-4">
                            <span className="text-3xl font-bold text-zinc-900 dark:text-white">
                                {matches.length > 0 ? Math.round((wins / (wins + losses)) * 100) : 0}%
                            </span>
                            <span className="text-xs text-zinc-500 block">de vitórias</span>
                        </div>
                    </div>

                    {/* Key Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="glass-card p-6 flex flex-col justify-center">
                            <Trophy className="text-gaia-yellow mb-2" size={24} />
                            <span className="text-2xl font-bold text-zinc-900 dark:text-white">{wins}</span>
                            <span className="text-xs text-zinc-500 uppercase font-bold">Vitórias</span>
                        </div>
                        <div className="glass-card p-6 flex flex-col justify-center">
                            <span className="text-2xl font-bold text-zinc-900 dark:text-white">{pointsScored}</span>
                            <span className="text-xs text-zinc-500 uppercase font-bold">Pontos Marcados</span>
                        </div>
                        <div className="glass-card p-6 flex flex-col justify-center col-span-2">
                            <span className="text-xs text-zinc-500 uppercase font-bold mb-1">Maior Vitória</span>
                            {biggestWin.match ? (
                                <div>
                                    <div className="text-xl font-bold text-gaia-yellow">+{biggestWin.margin} pts</div>
                                    <div className="text-sm text-zinc-600 dark:text-zinc-300">
                                        vs {isFCGaia(biggestWin.match.equipa_casa) ? biggestWin.match.equipa_fora : biggestWin.match.equipa_casa}
                                    </div>
                                    <div className="text-xs text-zinc-500 mt-1">
                                        {new Date(biggestWin.match.data).toLocaleDateString('pt-PT')}
                                    </div>
                                </div>
                            ) : (
                                <span>--</span>
                            )}
                        </div>
                    </div>

                </div>
            )}
        </div>
    )
}

export default Stats
