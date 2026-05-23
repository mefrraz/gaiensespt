import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Search, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { GameCard } from '../components/GameCard'
import { useClub, type Club } from '../lib/ClubContext'
import { type Match } from '../components/types'

function normalize(s: string): string {
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

const POPULAR_COMPETITIONS = [
    'Liga Betclic Masculina',
    'Campeonato da Proliga',
    'Campeonato Nacional da 1ª Divisão Masculina',
    'Liga Betclic Feminina',
    'Taça de Portugal Masculina Skoiy',
    'Taça de Portugal Feminina Skoiy',
]

function Landing() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<Club[]>([])
    const [showDropdown, setShowDropdown] = useState(false)
    const [selectedIdx, setSelectedIdx] = useState(-1)
    const [games, setGames] = useState<Match[]>([])
    const [gamesLoading, setGamesLoading] = useState(true)
    const inputRef = useRef<HTMLInputElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()
    const { clubs, loadClubs, favoriteClub } = useClub()

    const normalizedClubs = useMemo(() =>
        clubs.map(c => ({
            ...c,
            _n: normalize(c.search_name || c.name),
        })),
    [clubs])

    useEffect(() => { loadClubs() }, [loadClubs])

    useEffect(() => {
        supabase
            .from('games_2025_2026')
            .select('*')
            .in('competicao', POPULAR_COMPETITIONS)
            .neq('status', 'FINALIZADO')
            .gte('data', new Date().toISOString().split('T')[0])
            .order('data', { ascending: true })
            .limit(20)
            .then(({ data }) => {
                if (data && data.length > 0) setGames(data as Match[])
                setGamesLoading(false)
            })
    }, [])

    useEffect(() => {
        if (!query.trim()) {
            setResults([])
            setShowDropdown(false)
            setSelectedIdx(-1)
            return
        }
        const q = normalize(query)
        const filtered = normalizedClubs.filter(c => c._n.includes(q))
        setResults(filtered.slice(0, 20))
        setShowDropdown(true)
        setSelectedIdx(-1)
    }, [query, normalizedClubs])

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
                inputRef.current && !inputRef.current.contains(e.target as Node)) {
                setShowDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showDropdown || results.length === 0) return
        if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, results.length - 1)) }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, -1)) }
        else if (e.key === 'Enter') {
            e.preventDefault()
            if (selectedIdx >= 0) selectClub(results[selectedIdx])
        } else if (e.key === 'Escape') { setShowDropdown(false) }
    }

    const selectClub = (club: Club) => {
        navigate(`/clube/${club.slug}/home`)
        setQuery('')
        setShowDropdown(false)
    }

    return (
        <div className="pb-24">
            {/* Header — clean, centered, no solid color block */}
            <div className="max-w-2xl mx-auto px-4 pt-12 md:pt-20 pb-8 text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-dribly-purple/10 dark:bg-dribly-purple/20 text-dribly-purple text-[11px] font-bold uppercase tracking-wider mb-6">
                    <span className="w-1.5 h-1.5 rounded-full bg-dribly-purple animate-pulse" />
                    Época 2025/2026
                </div>

                <h1 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight mb-3">
                    Basquetebol Português
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed mb-8">
                    Pesquisa o teu clube e acompanha resultados, jogos e classificações.
                </p>

                {/* Search Bar — main focal point */}
                <div className="max-w-lg mx-auto relative animate-slide-up" ref={dropdownRef}>
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <Search size={20} className="text-zinc-400" />
                    </div>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => query.trim() && setShowDropdown(true)}
                        placeholder="Pesquisar clube..."
                        className="w-full pl-12 pr-4 py-4 glass-card text-sm text-zinc-900 dark:text-white placeholder-zinc-400 outline-none shadow-lg transition-all"
                    />

                    {showDropdown && results.length > 0 && (
                        <div className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden z-50 text-left max-h-80 overflow-y-auto">
                            {results.map((club, i) => (
                                <button
                                    key={club.slug}
                                    onClick={() => selectClub(club)}
                                    className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                                        selectedIdx === i ? 'bg-dribly-purple/10 dark:bg-dribly-purple/20' : 'hover:bg-zinc-50 dark:hover:bg-white/5'
                                    }`}
                                >
                                    <div className="w-9 h-9 rounded-full bg-dribly-purple/10 dark:bg-dribly-purple/20 flex items-center justify-center shrink-0">
                                        <span className="text-xs font-bold text-dribly-purple">{club.name.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <span className="text-sm font-medium text-zinc-900 dark:text-white truncate">{club.name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Favorite shortcut */}
                {favoriteClub && (
                    <Link
                        to={`/clube/${favoriteClub.slug}/home`}
                        className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-full bg-dribly-purple/5 dark:bg-dribly-purple/10 text-dribly-purple text-xs font-bold border border-dribly-purple/20 hover:bg-dribly-purple/10 dark:hover:bg-dribly-purple/20 transition-all group"
                    >
                        <HomeIcon size={14} />
                        <span>Continuar com {favoriteClub.name}</span>
                        <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                )}
            </div>

            {/* Divider */}
            <div className="max-w-2xl mx-auto px-4">
                <div className="h-px bg-zinc-200 dark:bg-white/10" />
            </div>

            {/* Stats Bar */}
            <div className="max-w-2xl mx-auto px-4 py-5 flex items-center justify-center gap-8 md:gap-16">
                <span className="text-xs text-zinc-500"><strong className="text-zinc-900 dark:text-white font-bold">79</strong> Clubes</span>
                <span className="text-xs text-zinc-500"><strong className="text-zinc-900 dark:text-white font-bold">411</strong> Competições</span>
                <span className="text-xs text-zinc-500"><strong className="text-zinc-900 dark:text-white font-bold">24</strong> Associações</span>
            </div>

            {/* Jogos em Destaque */}
            <div className="py-8">
                <div className="max-w-2xl mx-auto px-4 mb-4">
                    <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-dribly-purple animate-pulse" />
                        Jogos em Destaque
                    </h2>
                </div>

                <div className="max-w-2xl mx-auto px-4">
                    {gamesLoading ? (
                        <div className="flex gap-3 overflow-hidden">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="min-w-[280px] h-44 rounded-2xl bg-zinc-100 dark:bg-zinc-900 animate-pulse shrink-0" />
                            ))}
                        </div>
                    ) : games.length === 0 ? (
                        <p className="text-xs text-zinc-400 text-center py-8">Nenhum jogo em destaque de momento.</p>
                    ) : (
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                            {games.map(match => (
                                <div key={match.slug || match.id} className="min-w-[280px] shrink-0">
                                    <GameCard match={match} mode="agenda" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function HomeIcon({ size, className }: { size: number; className?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    )
}

export default Landing
