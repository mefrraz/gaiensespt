import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Loader2, Trophy, Sun, Moon, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCarouselGames } from '../hooks/useCarouselGames'

interface ClubResult { id: number; name: string; slug: string; logo_url: string | null }
interface CompResult { competition_id: number; competition_name: string; association_id: number }

function formatDate(d: string) {
    try { return new Date(d).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' }) } catch { return d }
}

export default function LandingPage() {
    const navigate = useNavigate()
    const [search, setSearch] = useState('')
    const [clubs, setClubs] = useState<ClubResult[]>([])
    const [comps, setComps] = useState<CompResult[]>([])
    const [searching, setSearching] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const [focusIdx, setFocusIdx] = useState(-1)
    const { games: carouselGames, loading: carouselLoading } = useCarouselGames()
    const [carouselIdx, setCarouselIdx] = useState(0)
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')

    useEffect(() => {
        if (theme === 'dark') document.documentElement.classList.add('dark')
        else document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', theme)
    }, [theme])

    const itemsPerSlide = typeof window !== 'undefined' && window.innerWidth >= 768 ? 3 : 1
    const maxIdx = Math.max(0, Math.ceil(carouselGames.length / itemsPerSlide) - 1)

    useEffect(() => {
        if (search.length < 1) { setClubs([]); setComps([]); setShowDropdown(false); return }
        const t = setTimeout(() => searchClubsAndComps(search), 250)
        return () => clearTimeout(t)
    }, [search])

    async function searchClubsAndComps(q: string) {
        setSearching(true)
        const [cRes, compRes] = await Promise.all([
            supabase.from('clubs').select('id, name, slug, logo_url').ilike('search_name', `%${q}%`).limit(5),
            supabase.from('competitions').select('competition_id, competition_name, association_id').eq('season', '2025/2026').ilike('competition_name', `%${q}%`).limit(3)
        ])
        setClubs((cRes.data || []) as ClubResult[])
        setComps((compRes.data || []).map(r => ({ competition_id: r.competition_id as number, competition_name: r.competition_name as string, association_id: r.association_id as number })))
        setSearching(false); setShowDropdown(true); setFocusIdx(-1)
    }

    const total = clubs.length + comps.length
    return (
        <div className="h-screen flex flex-col bg-[#F9F9FF] dark:bg-[#0D0D14] text-[#0D0D14] dark:text-[#F1F0FF]">
            {/* Top bar */}
            <header className="sticky top-0 z-50 bg-[#F9F9FF]/80 dark:bg-[#0D0D14]/80 backdrop-blur-md border-b border-[#E4E2F5] dark:border-[#2A2A3D] px-4 h-12 flex items-center justify-between shrink-0">
                <Link to="/" className="font-black text-sm text-violet-600">Dribly</Link>
                <div className="flex items-center gap-2">
                    <Link to="/standings" className="text-[10px] font-bold text-[#6B6880] dark:text-[#9B99B5] hover:text-violet-600 transition-colors">Classificações</Link>
                    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-1.5 rounded-lg hover:bg-[#E4E2F5] dark:hover:bg-[#2A2A3D] transition-colors">
                        {theme === 'dark' ? <Sun size={14} className="text-[#9B99B5]" /> : <Moon size={14} className="text-[#6B6880]" />}
                    </button>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 -mt-8">
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-2 text-center">Dribly</h1>
                <p className="text-sm text-[#6B6880] dark:text-[#9B99B5] mb-8 text-center max-w-sm">Resultados e classificações do basquetebol português</p>

                <div className="relative w-full max-w-lg">
                    <div className="relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9B99B5]" />
                        <input
                            type="text" value={search}
                            onChange={e => setSearch(e.target.value)}
                            onFocus={() => search.length >= 1 && setShowDropdown(true)}
                            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                            onKeyDown={e => {
                                if (e.key === 'ArrowDown') { e.preventDefault(); setFocusIdx(i => Math.min(i + 1, total - 1)) }
                                else if (e.key === 'ArrowUp') { e.preventDefault(); setFocusIdx(i => Math.max(i - 1, 0)) }
                                else if (e.key === 'Enter' && focusIdx >= 0) {
                                    if (focusIdx < clubs.length) navigate(`/clube/${clubs[focusIdx].slug}`)
                                    else { const c = comps[focusIdx - clubs.length]; navigate(`/standings/${c.association_id}/${c.competition_id}`) }
                                    setShowDropdown(false)
                                } else if (e.key === 'Escape') setShowDropdown(false)
                            }}
                            placeholder="Pesquisar clube ou competição..."
                            className="w-full bg-white dark:bg-[#16161F] border border-[#E4E2F5] dark:border-[#2A2A3D] rounded-2xl pl-11 pr-4 py-3.5 placeholder-[#9B99B5] focus:outline-none focus:border-violet-600/50 focus:ring-4 focus:ring-violet-600/10 transition-all text-sm"
                        />
                        {searching && <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-[#9B99B5]" />}
                    </div>

                    {showDropdown && total > 0 && (
                        <div className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-[#16161F] border border-[#E4E2F5] dark:border-[#2A2A3D] rounded-2xl shadow-2xl overflow-hidden z-50">
                            {clubs.length > 0 && <>
                                <div className="px-4 py-2 text-[10px] font-bold text-[#6B6880] uppercase tracking-wider">Clubes</div>
                                {clubs.map((c, i) => (
                                    <button key={c.id} onMouseDown={() => { setShowDropdown(false); navigate(`/clube/${c.slug}`) }}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#F0EFFE] dark:hover:bg-[#1E1E2E] transition-colors ${focusIdx === i ? 'bg-[#F0EFFE] dark:bg-[#1E1E2E]' : ''}`}>
                                        <div className="w-7 h-7 rounded-full bg-[#E4E2F5] dark:bg-[#2A2A3D] flex items-center justify-center shrink-0 text-[10px] font-bold">{c.name.charAt(0)}</div>
                                        <span className="text-sm font-medium">{c.name}</span>
                                    </button>
                                ))}
                            </>}
                            {comps.length > 0 && <>
                                <div className="px-4 py-2 text-[10px] font-bold text-[#6B6880] uppercase tracking-wider border-t border-[#E4E2F5] dark:border-[#2A2A3D]">Competições</div>
                                {comps.map((c, i) => (
                                    <button key={c.competition_id} onMouseDown={() => { setShowDropdown(false); navigate(`/standings/${c.association_id}/${c.competition_id}`) }}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#F0EFFE] dark:hover:bg-[#1E1E2E] transition-colors ${focusIdx === clubs.length + i ? 'bg-[#F0EFFE] dark:bg-[#1E1E2E]' : ''}`}>
                                        <Trophy size={14} className="text-violet-600 shrink-0" />
                                        <span className="text-sm font-medium">{c.competition_name}</span>
                                    </button>
                                ))}
                            </>}
                        </div>
                    )}
                </div>
            </div>

            {/* Carousel section */}
            {!carouselLoading && carouselGames.length > 0 && (
                <div className="shrink-0 pb-8 px-4 max-w-4xl w-full mx-auto">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-[#6B6880] dark:text-[#9B99B5] uppercase tracking-wider">Jogos em destaque</p>
                        <div className="flex gap-1">
                            <button onClick={() => setCarouselIdx(i => Math.max(0, i - 1))} disabled={carouselIdx === 0} className="p-1 rounded-lg hover:bg-[#E4E2F5] dark:hover:bg-[#2A2A3D] disabled:opacity-30 transition-opacity"><ChevronLeft size={16} /></button>
                            <button onClick={() => setCarouselIdx(i => Math.min(maxIdx, i + 1))} disabled={carouselIdx === maxIdx} className="p-1 rounded-lg hover:bg-[#E4E2F5] dark:hover:bg-[#2A2A3D] disabled:opacity-30 transition-opacity"><ChevronRight size={16} /></button>
                        </div>
                    </div>
                    <div className="flex gap-3 overflow-hidden">
                        {carouselGames.slice(carouselIdx * itemsPerSlide, (carouselIdx + 1) * itemsPerSlide + 1).map((g, i) => (
                            <div key={i} className={`shrink-0 bg-white dark:bg-[#16161F] border border-[#E4E2F5] dark:border-[#2A2A3D] rounded-2xl p-3.5 hover:border-violet-600/30 transition-colors ${itemsPerSlide === 3 ? 'w-[calc(33.33%-0.5rem)]' : 'w-[220px]'}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold text-violet-600 uppercase">{g.competition}</span>
                                    <span className="text-[10px] font-bold text-[#9B99B5]">{g.status === 'FINALIZADO' ? 'FIM' : 'AGEN'}</span>
                                </div>
                                <div className="space-y-1 mb-2">
                                    <p className="text-xs font-bold truncate">{g.home}</p>
                                    <p className="text-xs font-bold truncate">{g.away}</p>
                                </div>
                                <div className="flex items-center justify-between">
                                    {g.score ? <span className="text-xs font-black tabular-nums">{g.score}</span> : <span className="text-[10px] text-[#9B99B5]">vs</span>}
                                    <span className="text-[10px] text-[#9B99B5]">{formatDate(g.date)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
