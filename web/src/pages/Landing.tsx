import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Search, Trophy, BarChart2, TrendingUp, Building2 } from 'lucide-react'
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
    const { clubs, loadClubs } = useClub()

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
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setSelectedIdx(i => Math.min(i + 1, results.length - 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setSelectedIdx(i => Math.max(i - 1, -1))
        } else if (e.key === 'Enter') {
            e.preventDefault()
            if (selectedIdx >= 0) {
                selectClub(results[selectedIdx])
            } else if (query.trim()) {
                navigate(`/clube/${encodeURIComponent(query.trim().toLowerCase().replace(/\s+/g, '-'))}/home`)
                setQuery('')
                setShowDropdown(false)
            }
        } else if (e.key === 'Escape') {
            setShowDropdown(false)
        }
    }

    const selectClub = (club: Club) => {
        navigate(`/clube/${club.slug}/home`)
        setQuery('')
        setShowDropdown(false)
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-24">
            {/* Hero Section */}
            <div className="text-center pt-8 md:pt-16 pb-4 px-4 animate-fade-in">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-dribly-blue/10 dark:bg-dribly-blue/20 text-dribly-blue text-[11px] font-bold uppercase tracking-wider mb-6">
                    <span className="w-1.5 h-1.5 rounded-full bg-dribly-blue animate-pulse" />
                    Época 2025/2026
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight mb-4">
                    Basquetebol<br />Português ao Vivo
                </h1>
                <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
                    Pesquisa o teu clube e acompanha jogos, resultados e classificações de todo o basquetebol em Portugal.
                </p>
            </div>

            {/* Search Bar */}
            <div className="px-4 max-w-xl mx-auto relative animate-slide-up">
                <div className="relative" ref={dropdownRef}>
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
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
                        className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:ring-2 focus:ring-dribly-blue/30 focus:border-dribly-blue shadow-lg shadow-zinc-200/50 dark:shadow-black/20 transition-all"
                    />

                    {showDropdown && results.length > 0 && (
                        <div className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden z-50">
                            {results.map((club, i) => (
                                <button
                                    key={club.slug}
                                    onClick={() => selectClub(club)}
                                    className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                                        selectedIdx === i
                                            ? 'bg-dribly-blue/10 dark:bg-dribly-blue/20'
                                            : 'hover:bg-zinc-50 dark:hover:bg-white/5'
                                    }`}
                                >
                                    <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-white/10 flex items-center justify-center shrink-0">
                                        {club.logo_url ? (
                                            <img src={club.logo_url} alt="" className="w-6 h-6 object-contain" />
                                        ) : (
                                            <span className="text-xs font-bold text-zinc-500">{club.name.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <span className="text-sm font-medium text-zinc-900 dark:text-white block truncate">{club.name}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <p className="text-center text-[10px] text-zinc-400 mt-3">
                    197 clubes disponíveis · Dados oficiais da FPB
                </p>
            </div>

            {/* Game Carousel */}
            <div className="animate-slide-up">
                <GameCarousel />
            </div>

            {/* Quick Links */}
            <div className="px-4 grid grid-cols-2 md:grid-cols-4 gap-3 animate-slide-up">
                <LinkCard
                    to="/standings"
                    icon={<BarChart2 size={22} />}
                    title="Classificações"
                    desc="Todas as associações"
                    color="bg-blue-500"
                />
                <LinkCard
                    to="/standings"
                    icon={<Trophy size={22} />}
                    title="Competições"
                    desc="400+ competições"
                    color="bg-amber-500"
                />
                <LinkCard
                    to="/about"
                    icon={<Building2 size={22} />}
                    title="Sobre"
                    desc="Como funciona"
                    color="bg-emerald-500"
                />
                <LinkCard
                    to="/install"
                    icon={<TrendingUp size={22} />}
                    title="Instalar App"
                    desc="No teu telemóvel"
                    color="bg-violet-500"
                />
            </div>

            {/* Stats Bar */}
            <div className="px-4 animate-slide-up">
                <div className="glass-card p-5 flex items-center justify-around">
                    <StatItem value="197" label="Clubes" />
                    <div className="w-px h-10 bg-zinc-200 dark:bg-white/10" />
                    <StatItem value="411" label="Competições" />
                    <div className="w-px h-10 bg-zinc-200 dark:bg-white/10" />
                    <StatItem value="24" label="Associações" />
                </div>
            </div>
        </div>
    )
}

function LinkCard({ to, icon, title, desc, color }: { to: string; icon: React.ReactNode; title: string; desc: string; color: string }) {
    return (
        <Link to={to} className="glass-card p-4 flex flex-col gap-3 group hover:border-dribly-blue/30">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-white`}>
                {icon}
            </div>
            <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-dribly-blue transition-colors">{title}</h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">{desc}</p>
            </div>
        </Link>
    )
}

function StatItem({ value, label }: { value: string; label: string }) {
    return (
        <div className="text-center">
            <span className="text-xl font-black text-zinc-900 dark:text-white">{value}</span>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wide mt-0.5">{label}</p>
        </div>
    )
}

export default Landing
