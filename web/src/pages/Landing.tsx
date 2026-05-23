import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Search, Trophy, BarChart2, TrendingUp, Building2, ArrowRight, ChevronRight } from 'lucide-react'
import { GameCarousel } from '../components/GameCarousel'
import { useClub, type Club } from '../lib/ClubContext'

function Landing() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<Club[]>([])
    const [showDropdown, setShowDropdown] = useState(false)
    const [selectedIdx, setSelectedIdx] = useState(-1)
    const inputRef = useRef<HTMLInputElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()
    const { clubs, loadClubs, favoriteClub } = useClub()

    useEffect(() => {
        loadClubs()
    }, [loadClubs])

    useEffect(() => {
        if (!query.trim()) {
            setResults([])
            setShowDropdown(false)
            setSelectedIdx(-1)
            return
        }
        const q = query.toLowerCase()
        const filtered = clubs.filter(c =>
            c.search_name?.includes(q) || c.name.toLowerCase().includes(q)
        ).slice(0, 6)
        setResults(filtered)
        setShowDropdown(true)
        setSelectedIdx(-1)
    }, [query, clubs])

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
            if (selectedIdx >= 0) { selectClub(results[selectedIdx]) }
            else if (query.trim()) { selectClub({ name: query.trim(), slug: query.trim().toLowerCase().replace(/\s+/g, '-') } as Club) }
        }
        else if (e.key === 'Escape') { setShowDropdown(false) }
    }

    const selectClub = (club: Club) => {
        navigate(`/clube/${club.slug}/home`)
        setQuery('')
        setShowDropdown(false)
    }

    return (
        <div className="pb-24">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-dribly-blue via-blue-600 to-dribly-blue-dark dark:from-dribly-blue-dark dark:via-blue-900 dark:to-dribly-black">
                <div className="max-w-5xl mx-auto px-4 pt-12 md:pt-16 pb-10 md:pb-14 text-center relative z-10">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-[11px] font-bold uppercase tracking-wider mb-5 border border-white/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        Época 2025/2026
                    </div>

                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-3 leading-tight">
                        Basquetebol<br />Português ao Vivo
                    </h1>
                    <p className="text-sm md:text-base text-white/70 max-w-md mx-auto leading-relaxed mb-6">
                        Pesquisa o teu clube e acompanha jogos, resultados e classificações.
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-lg mx-auto relative" ref={dropdownRef}>
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
                            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-900 border border-transparent rounded-2xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:ring-2 focus:ring-white/30 shadow-2xl shadow-black/20 transition-all"
                        />

                        {showDropdown && results.length > 0 && (
                            <div className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden z-50 text-left">
                                {results.map((club, i) => (
                                    <button
                                        key={club.slug}
                                        onClick={() => selectClub(club)}
                                        className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                                            selectedIdx === i ? 'bg-dribly-blue/10 dark:bg-dribly-blue/20' : 'hover:bg-zinc-50 dark:hover:bg-white/5'
                                        }`}
                                    >
                                        <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-white/10 flex items-center justify-center shrink-0">
                                            {club.logo_url ? (
                                                <img src={club.logo_url} alt="" className="w-6 h-6 object-contain" />
                                            ) : (
                                                <span className="text-xs font-bold text-zinc-500">{club.name.charAt(0)}</span>
                                            )}
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
                            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-xs font-bold border border-white/10 hover:bg-white/20 transition-all group"
                        >
                            <HomeIcon size={14} />
                            <span>Continuar com {favoriteClub.name}</span>
                            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    )}
                </div>
            </div>

            {/* Stats Bar */}
            <div className="bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-white/5">
                <div className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-around md:justify-center md:gap-20">
                    <span className="text-xs text-zinc-500"><strong className="text-zinc-900 dark:text-white">197</strong> Clubes</span>
                    <span className="text-xs text-zinc-500"><strong className="text-zinc-900 dark:text-white">411</strong> Competições</span>
                    <span className="text-xs text-zinc-500"><strong className="text-zinc-900 dark:text-white">24</strong> Associações</span>
                </div>
            </div>

            {/* Game Carousel */}
            <div className="py-8 bg-zinc-50/50 dark:bg-zinc-950/50">
                <div className="max-w-5xl mx-auto">
                    <GameCarousel />
                </div>
            </div>

            {/* Quick Links — all blue */}
            <div className="max-w-5xl mx-auto px-4 py-8">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-5">Explorar</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <QuickCard
                        to="/standings"
                        icon={<BarChart2 size={22} />}
                        title="Classificações"
                        desc="Tabelas de todas as associações"
                        gradient="from-dribly-blue to-dribly-blue-dim"
                    />
                    <QuickCard
                        to="/standings"
                        icon={<Trophy size={22} />}
                        title="Competições"
                        desc="400+ competições disponíveis"
                        gradient="from-dribly-blue-light to-dribly-blue"
                    />
                    <QuickCard
                        to="/about"
                        icon={<Building2 size={22} />}
                        title="Sobre"
                        desc="Como funciona o Dribly"
                        gradient="from-dribly-blue-dim to-dribly-blue-dark"
                    />
                    <QuickCard
                        to="/install"
                        icon={<TrendingUp size={22} />}
                        title="Instalar App"
                        desc="No ecrã do telemóvel"
                        gradient="from-dribly-blue to-blue-700"
                    />
                </div>
            </div>
        </div>
    )
}

function QuickCard({ to, icon, title, desc, gradient }: { to: string; icon: React.ReactNode; title: string; desc: string; gradient: string }) {
    return (
        <Link to={to} className="glass-card p-5 flex flex-col gap-4 group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-dribly-blue transition-colors flex items-center gap-1">
                    {title}
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </h3>
                <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">{desc}</p>
            </div>
        </Link>
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
