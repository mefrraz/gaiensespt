import { useState, useRef, useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Search, Building2, Trophy, ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useClub, type Club } from '../lib/ClubContext'

function normalize(s: string): string {
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

interface CompetitionResult {
    competition_id: number
    competition_name: string
    association_id: number
    association_name: string
}

function SearchPage() {
    const [searchParams] = useSearchParams()
    const initialQuery = searchParams.get('q') || ''
    const [query, setQuery] = useState(initialQuery)
    const [clubResults, setClubResults] = useState<Club[]>([])
    const [compResults, setCompResults] = useState<CompetitionResult[]>([])
    const [allComps, setAllComps] = useState<CompetitionResult[]>([])
    const inputRef = useRef<HTMLInputElement>(null)
    const navigate = useNavigate()
    const { clubs, loadClubs } = useClub()

    const normalizedClubs = useMemo(() =>
        clubs.map(c => ({ ...c, _n: normalize(c.search_name || c.name) })),
    [clubs])

    useEffect(() => { loadClubs() }, [loadClubs])
    useEffect(() => { inputRef.current?.focus() }, [])

    useEffect(() => {
        supabase.from('competitions').select('competition_id, competition_name, association_id, association_name')
            .eq('season', '2025/2026').then(({ data }) => {
                if (data) {
                    const seen: Record<number, CompetitionResult> = {}
                    ;(data as CompetitionResult[]).forEach(r => {
                        if (!seen[r.competition_id]) seen[r.competition_id] = r
                    })
                    setAllComps(Object.values(seen))
                    // If initial query, trigger search
                    if (initialQuery) {
                        const q = normalize(initialQuery)
                        setClubResults(normalizedClubs.filter(c => c._n.includes(q)))
                        setCompResults(Object.values(seen).filter(c => normalize(c.competition_name).includes(q)))
                    }
                }
            })
    }, [])

    useEffect(() => {
        if (!query.trim()) {
            setClubResults([])
            setCompResults([])
            return
        }
        const q = normalize(query)
        setClubResults(normalizedClubs.filter(c => c._n.includes(q)))
        if (allComps.length > 0) {
            setCompResults(allComps.filter(c => normalize(c.competition_name).includes(q)))
        }
    }, [query, normalizedClubs, allComps])

    const totalResults = clubResults.length + compResults.length

    return (
        <div className="max-w-2xl mx-auto px-4 pb-24">
            <div className="flex items-center gap-3 pt-2 mb-6">
                <Link to="/" className="p-2 -ml-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                    <ArrowLeft size={22} />
                </Link>
                <h1 className="text-lg font-bold text-zinc-900 dark:text-white">Pesquisar</h1>
            </div>

            <div className="relative mb-8">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search size={20} className="text-zinc-400" />
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Pesquisar clubes e competições..."
                    className="w-full pl-12 pr-4 py-4 glass-card text-sm text-zinc-900 dark:text-white placeholder-zinc-400 outline-none shadow-lg transition-all"
                />
            </div>

            {query.trim() && (
                <div className="space-y-6">
                    {totalResults === 0 && (
                        <p className="text-sm text-zinc-500 text-center py-12">
                            Nenhum resultado encontrado para "{query}"
                        </p>
                    )}

                    {clubResults.length > 0 && (
                        <div className="animate-slide-up">
                            <div className="flex items-center gap-2 mb-3">
                                <Building2 size={14} className="text-dribly-purple" />
                                <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Clubes ({clubResults.length})</h2>
                            </div>
                            <div className="space-y-2">
                                {clubResults.map(club => (
                                    <button
                                        key={club.slug}
                                        onClick={() => navigate('/clube/' + club.slug + '/home')}
                                        className="w-full text-left glass-card p-4 flex items-center gap-3 hover:border-dribly-purple/20 group transition-colors"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-dribly-purple/10 dark:bg-dribly-purple/20 flex items-center justify-center shrink-0">
                                            <span className="text-sm font-bold text-dribly-purple">{club.name.charAt(0).toUpperCase()}</span>
                                        </div>
                                        <span className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-dribly-purple transition-colors truncate">{club.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {compResults.length > 0 && (
                        <div className="animate-slide-up">
                            <div className="flex items-center gap-2 mb-3">
                                <Trophy size={14} className="text-dribly-purple" />
                                <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Competições ({compResults.length})</h2>
                            </div>
                            <div className="space-y-2">
                                {compResults.map(comp => (
                                    <button
                                        key={comp.competition_id}
                                        onClick={() => navigate('/standings/' + comp.association_id + '/' + comp.competition_id)}
                                        className="w-full text-left glass-card p-4 flex items-center gap-3 hover:border-dribly-purple/20 group transition-colors"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-dribly-purple/10 dark:bg-dribly-purple/20 flex items-center justify-center shrink-0">
                                            <Trophy size={18} className="text-dribly-purple" />
                                        </div>
                                        <div className="min-w-0">
                                            <span className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-dribly-purple transition-colors truncate block">{comp.competition_name}</span>
                                            <span className="text-[10px] text-zinc-400">{comp.association_name}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default SearchPage
