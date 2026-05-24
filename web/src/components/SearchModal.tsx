import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Building2, Trophy } from 'lucide-react'
import { useClub, type Club } from '../lib/ClubContext'
import { supabase } from '../lib/supabase'
import { associationLogoUrl } from '../lib/associationLogos'

function normalize(s: string): string {
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

interface CompetitionResult {
    competition_id: number
    competition_name: string
    association_id: number
    association_name: string
}

interface SearchModalProps {
    isOpen: boolean
    onClose: () => void
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [query, setQuery] = useState('')
    const [clubResults, setClubResults] = useState<Club[]>([])
    const [compResults, setCompResults] = useState<CompetitionResult[]>([])
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const inputRef = useRef<HTMLInputElement>(null)
    const navigate = useNavigate()
    const { clubs, loadClubs } = useClub()
    const [allComps, setAllComps] = useState<CompetitionResult[]>([])

    const normalizedClubs = useMemo(() =>
        clubs.map(c => ({
            ...c,
            _n: normalize(c.search_name || c.name),
        })),
    [clubs])

    useEffect(() => {
        supabase.from('competitions').select('competition_id, competition_name, association_id, association_name').eq('season','2025/2026').then(({data}) => { if (data) { const seen: Record<number, CompetitionResult> = {}; (data as CompetitionResult[]).forEach(c => { if (!seen[c.competition_id]) seen[c.competition_id] = c }); setAllComps(Object.values(seen)) } })
    }, [])

    useEffect(() => {
        if (isOpen) {
            setQuery('')
            setClubResults([])
            setCompResults([])
            setSelectedIndex(-1)
            setTimeout(() => inputRef.current?.focus(), 100)
            loadClubs()
        }
    }, [isOpen, loadClubs])

    useEffect(() => {
        if (!query.trim()) {
            setClubResults([])
            setCompResults([])
            setSelectedIndex(-1)
            return
        }
        const q = normalize(query)
        const filtered = normalizedClubs
            .filter(c => c._n.includes(q))
            .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
            .slice(0, 15)
        // Remove _n property before setting state
        const clean = filtered.map(({ _n, ...rest }) => rest as Club)
        setClubResults(clean)

        const timeout = setTimeout(() => {
            if (allComps.length > 0) {
                const q = normalize(query)
                const filtered = allComps.filter(c => normalize(c.competition_name).includes(q))
                setCompResults(filtered.slice(0, 15))
            }
        }, 150)
        return () => clearTimeout(timeout)
    }, [query, clubs])

    const totalResults = clubResults.length + compResults.length

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setSelectedIndex(i => Math.min(i + 1, totalResults - 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setSelectedIndex(i => Math.max(i - 1, -1))
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            e.preventDefault()
            selectItem(selectedIndex)
        } else if (e.key === 'Escape') {
            onClose()
        }
    }

    const selectItem = (index: number) => {
        if (index < clubResults.length) {
            const club = clubResults[index]
            navigate(`/clube/${club.slug}/home`)
        } else {
            const comp = compResults[index - clubResults.length]
            navigate(`/standings/${comp.association_id}/${comp.competition_id}`)
        }
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-white/10 overflow-hidden animate-slide-up">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-100 dark:border-white/5">
                    <Search size={18} className="text-zinc-400 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => { setQuery(e.target.value); setSelectedIndex(-1) }}
                        onKeyDown={handleKeyDown}
                            placeholder="Pesquisar clubes e competições..."
                        className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-white placeholder-zinc-400 outline-none"
                    />
                    {query && (
                        <button onClick={() => setQuery('')} className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                            <X size={16} />
                        </button>
                    )}
                    <button onClick={onClose} className="text-[10px] font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 uppercase px-2 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5">
                        ESC
                    </button>
                </div>

                {totalResults > 0 && (
                    <div className="max-h-80 overflow-y-auto">
                        {clubResults.length > 0 && (
                            <div>
                                <div className="px-4 py-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Building2 size={10} />
                                    Clubes
                                </div>
                                {clubResults.map((club, i) => (
                                    <button
                                        key={club.slug}
                                        onClick={() => selectItem(i)}
                                        className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors ${
                                            selectedIndex === i
                                                ? 'bg-dribly-blue/10 dark:bg-dribly-blue/20'
                                                : 'hover:bg-zinc-50 dark:hover:bg-white/5'
                                        }`}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                                            {club.logo_url ? (
                                                <img src={club.logo_url} alt="" className="w-5 h-5 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                                            ) : null}
                                            <span className={club.logo_url ? 'hidden' : 'text-xs font-bold text-zinc-500'}>{club.name.charAt(0)}</span>
                                        </div>
                                        <span className="text-sm font-medium text-zinc-900 dark:text-white truncate">{club.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {compResults.length > 0 && (
                            <div>
                                <div className="px-4 py-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 border-t border-zinc-100 dark:border-white/5">
                                    <Trophy size={10} />
                                    Competições
                                </div>
                                {compResults.map((comp, i) => {
                                    const idx = clubResults.length + i
                                    return (
                                        <button
                                            key={comp.competition_id}
                                            onClick={() => selectItem(idx)}
                                            className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors ${
                                                selectedIndex === idx
                                                    ? 'bg-dribly-blue/10 dark:bg-dribly-blue/20'
                                                    : 'hover:bg-zinc-50 dark:hover:bg-white/5'
                                            }`}
                                        >
                                            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                                                {associationLogoUrl(comp.association_id) ? (
                                                    <img src={associationLogoUrl(comp.association_id)!} alt="" className="w-5 h-5 object-contain" />
                                                ) : (
                                                    <Trophy size={14} className="text-zinc-400" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <span className="text-sm font-medium text-zinc-900 dark:text-white truncate block">{comp.competition_name}</span>
                                                <span className="text-[10px] text-zinc-400">{comp.association_name}</span>
                                            </div>
                                         </button>
                                     )
                                 })}
                             </div>
                         )}
                     </div>
                  )}
 
                 {query && totalResults === 0 && (
                     <div className="px-4 py-8 text-center text-sm text-zinc-400">
                        Nenhum resultado encontrado para "{query}"
                    </div>
                )}
            </div>
        </div>
    )
}
