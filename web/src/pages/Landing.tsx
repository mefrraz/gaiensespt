import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Search, ChevronRight, BarChart2, TrendingUp } from 'lucide-react'
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
    'Campeonato Nacional da 1a Divisao Masculina',
    'Liga Betclic Feminina',
    'Taca de Portugal Masculina Skoiy',
    'Taca de Portugal Feminina Skoiy',
]

const FEATURED_CLUBS = ['FC PORTO', 'SL Benfica-B', 'Sporting CP', 'FC GAIA', 'Belenenses', 'Academica Coimbra']

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
        clubs.map(c => ({ ...c, _n: normalize(c.search_name || c.name) })),
    [clubs])

    useEffect(() => { loadClubs() }, [loadClubs])

    useEffect(() => {
        supabase.from('games_2025_2026').select('*').in('competicao', POPULAR_COMPETITIONS).neq('status', 'FINALIZADO').gte('data', new Date().toISOString().split('T')[0]).order('data', { ascending: true }).limit(20)
            .then(({ data }) => { if (data && data.length > 0) setGames(data as Match[]); setGamesLoading(false) })
    }, [])

    useEffect(() => {
        if (!query.trim()) { setResults([]); setShowDropdown(false); setSelectedIdx(-1); return }
        const q = normalize(query)
        const filtered = normalizedClubs.filter(c => c._n.includes(q))
        setResults(filtered.slice(0, 20))
        setShowDropdown(true)
        setSelectedIdx(-1)
    }, [query, normalizedClubs])

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) && inputRef.current && !inputRef.current.contains(e.target as Node))
                setShowDropdown(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showDropdown || results.length === 0) return
        if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, results.length - 1)) }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, -1)) }
        else if (e.key === 'Enter') { e.preventDefault(); if (selectedIdx >= 0) selectClub(results[selectedIdx]) }
        else if (e.key === 'Escape') { setShowDropdown(false) }
    }

    const goToClub = (slug: string) => {
        navigate('/clube/' + slug + '/home')
        setQuery('')
        setShowDropdown(false)
    }

    const selectClub = (club: Club) => goToClub(club.slug)


    return (
        <div className="pb-24">
            {/* Hero with subtle gradient */}
            <div className="relative overflow-hidden bg-gradient-to-b from-dribly-purple/5 via-transparent to-transparent dark:from-dribly-purple/10 dark:via-transparent dark:to-transparent">
                <div className="max-w-2xl mx-auto px-4 pt-12 md:pt-16 pb-10 text-center relative">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-dribly-purple/10 dark:bg-dribly-purple/20 text-dribly-purple text-[11px] font-bold uppercase tracking-wider mb-6 animate-fade-in">
                        <span className="w-1.5 h-1.5 rounded-full bg-dribly-purple animate-pulse" />
                        Epoca 2025/2026
                    </div>

                    <h1 className="text-3xl md:text-5xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight mb-2 animate-slide-up">
                        Dribly<span className="text-dribly-purple">.</span>
                    </h1>
                    <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed mb-6 animate-slide-up">
                        Resultados de todos os clubes de basquetebol em Portugal
                    </p>

                    {/* Featured club chips */}
                    <div className="flex flex-wrap justify-center gap-2 mb-6 animate-slide-up">
                        {FEATURED_CLUBS.map(name => {
                            const c = clubs.find(x => name.toLowerCase().includes(x.name.toLowerCase().substring(0, 4)))
                            if (!c) return null
                            return (
                                <button key={c.slug}
                                    onClick={() => selectClub(c)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:border-dribly-purple/30 hover:text-dribly-purple hover:shadow-sm transition-all">
                                    <span className="w-5 h-5 rounded-full bg-dribly-purple/10 dark:bg-dribly-purple/20 flex items-center justify-center text-[9px] font-bold text-dribly-purple shrink-0">
                                        {name.charAt(0).toUpperCase()}
                                    </span>
                                    {name}
                                </button>
                            )
                        })}
                    </div>

                    {/* Search */}
                    <div className="max-w-lg mx-auto relative animate-slide-up" ref={dropdownRef}>
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <Search size={20} className="text-zinc-400" />
                        </div>
                        <input ref={inputRef} type="text" value={query}
                            onChange={e => { setQuery(e.target.value); setSelectedIdx(-1) }}
                            onKeyDown={handleKeyDown}
                            onFocus={() => query.trim() && setShowDropdown(true)}
                            placeholder="Pesquisar clube..."
                            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 outline-none shadow-lg shadow-zinc-200/50 dark:shadow-black/20 transition-all focus:ring-2 focus:ring-dribly-purple/30 focus:border-dribly-purple" />
                        {showDropdown && results.length > 0 && (
                            <div className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden z-50 text-left max-h-80 overflow-y-auto">
                                {results.map((club, i) => (
                                    <button key={club.slug} onClick={() => selectClub(club)}
                                        className={'w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ' + (selectedIdx === i ? 'bg-dribly-purple/10 dark:bg-dribly-purple/20' : 'hover:bg-zinc-50 dark:hover:bg-white/5')}>
                                        <div className="w-9 h-9 rounded-full bg-dribly-purple/10 dark:bg-dribly-purple/20 flex items-center justify-center shrink-0">
                                            <span className="text-xs font-bold text-dribly-purple">{club.name.charAt(0).toUpperCase()}</span>
                                        </div>
                                        <span className="text-sm font-medium text-zinc-900 dark:text-white truncate">{club.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {favoriteClub && (
                        <Link to={'/clube/' + favoriteClub.slug + '/home'}
                            className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-full bg-dribly-purple/5 dark:bg-dribly-purple/10 text-dribly-purple text-xs font-bold border border-dribly-purple/20 hover:bg-dribly-purple/10 dark:hover:bg-dribly-purple/20 transition-all group animate-slide-up">
                            <HomeIcon size={14} />
                            <span>Continuar com {favoriteClub.name}</span>
                            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    )}
                </div>
            </div>

            {/* Stats bar */}
            <div className="bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-white/5">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-center gap-6 md:gap-16">
                    <div className="text-center">
                        <span className="text-lg font-black text-zinc-900 dark:text-white">79</span>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wide mt-0.5">Clubes</p>
                    </div>
                    <div className="w-px h-8 bg-zinc-200 dark:bg-white/10" />
                    <div className="text-center">
                        <span className="text-lg font-black text-zinc-900 dark:text-white">411</span>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wide mt-0.5">Competicoes</p>
                    </div>
                    <div className="w-px h-8 bg-zinc-200 dark:bg-white/10" />
                    <div className="text-center">
                        <span className="text-lg font-black text-zinc-900 dark:text-white">24</span>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wide mt-0.5">Associacoes</p>
                    </div>
                </div>
            </div>

            {/* Jogos em Destaque */}
            <div className="py-8">
                <div className="max-w-2xl mx-auto px-4 mb-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-dribly-purple animate-pulse" />
                            Jogos em Destaque
                        </h2>
                    </div>
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

            {/* Quick Links */}
            <div className="max-w-2xl mx-auto px-4 py-4">
                <div className="grid grid-cols-2 gap-3">
                    <Link to="/standings" className="glass-card p-4 flex items-center gap-3 hover:border-dribly-purple/20 group">
                        <div className="w-10 h-10 rounded-xl bg-dribly-purple/10 dark:bg-dribly-purple/20 flex items-center justify-center shrink-0">
                            <BarChart2 size={20} className="text-dribly-purple" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-dribly-purple transition-colors">Classificacoes</h3>
                            <p className="text-[10px] text-zinc-500">Consultar tabelas</p>
                        </div>
                    </Link>
                    <Link to="/about" className="glass-card p-4 flex items-center gap-3 hover:border-dribly-purple/20 group">
                        <div className="w-10 h-10 rounded-xl bg-dribly-purple/10 dark:bg-dribly-purple/20 flex items-center justify-center shrink-0">
                            <TrendingUp size={20} className="text-dribly-purple" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-dribly-purple transition-colors">Sobre</h3>
                            <p className="text-[10px] text-zinc-500">Como funciona</p>
                        </div>
                    </Link>
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
