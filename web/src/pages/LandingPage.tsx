import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Loader2, Trophy } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface ClubResult { id: number; name: string; slug: string; logo_url: string | null }
interface CompResult { competition_id: number; competition_name: string; association_id: number }

export default function LandingPage() {
    const navigate = useNavigate()
    const [search, setSearch] = useState('')
    const [clubs, setClubs] = useState<ClubResult[]>([])
    const [comps, setComps] = useState<CompResult[]>([])
    const [searching, setSearching] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const [focusIdx, setFocusIdx] = useState(-1)

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
        setComps((compRes.data || []).map(r => ({
            competition_id: r.competition_id as number,
            competition_name: r.competition_name as string,
            association_id: r.association_id as number,
        })))
        setSearching(false)
        setShowDropdown(true)
        setFocusIdx(-1)
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        const total = clubs.length + comps.length
        if (e.key === 'ArrowDown') { e.preventDefault(); setFocusIdx(i => Math.min(i + 1, total - 1)) }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setFocusIdx(i => Math.max(i - 1, 0)) }
        else if (e.key === 'Enter' && focusIdx >= 0) {
            if (focusIdx < clubs.length) navigate(`/clube/${clubs[focusIdx].slug}`)
            else { const c = comps[focusIdx - clubs.length]; navigate(`/standings/${c.association_id}/${c.competition_id}`) }
            setShowDropdown(false)
        } else if (e.key === 'Escape') setShowDropdown(false)
    }

    function selectClub(slug: string) { setShowDropdown(false); setTimeout(() => navigate(`/clube/${slug}`), 100) }
    function selectComp(assocId: number, compId: number) { setShowDropdown(false); setTimeout(() => navigate(`/standings/${assocId}/${compId}`), 100) }

    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 flex flex-col items-center justify-start pt-16 sm:pt-24 px-4">
            {/* Logo */}
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-2 flex items-center gap-2">
                <span className="text-amber-500">Dribly</span>
            </h1>
            <p className="text-sm text-zinc-400 mb-8 text-center max-w-sm">
                Resultados, classificações e estatísticas do basquetebol português
            </p>

            {/* Search */}
            <div className="relative w-full max-w-lg">
                <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                        type="text" value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => search.length >= 1 && setShowDropdown(true)}
                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                        placeholder="Pesquisar clube ou competição..."
                        className="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-2xl pl-11 pr-4 py-3.5 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all text-sm sm:text-base"
                    />
                    {searching && <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-zinc-500" />}
                </div>

                {/* Dropdown */}
                {showDropdown && (clubs.length + comps.length > 0) && (
                    <div className="absolute top-full mt-2 left-0 right-0 bg-zinc-800 border border-zinc-700/50 rounded-2xl shadow-2xl overflow-hidden z-50">
                        {clubs.length > 0 && (
                            <div>
                                <div className="px-4 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Clubes</div>
                                {clubs.map((c, i) => (
                                    <button key={c.id} onClick={() => selectClub(c.slug)}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-zinc-700/50 transition-colors ${focusIdx === i ? 'bg-zinc-700/50' : ''}`}>
                                        <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center shrink-0 text-[10px] font-bold text-zinc-400">
                                            {c.name.charAt(0)}
                                        </div>
                                        <span className="text-sm font-medium text-zinc-200">{c.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                        {comps.length > 0 && (
                            <div>
                                <div className="px-4 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider border-t border-zinc-700/30">Competições</div>
                                {comps.map((c, i) => (
                                    <button key={c.competition_id} onClick={() => selectComp(c.association_id, c.competition_id)}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-zinc-700/50 transition-colors ${focusIdx === clubs.length + i ? 'bg-zinc-700/50' : ''}`}>
                                        <Trophy size={14} className="text-amber-500 shrink-0" />
                                        <span className="text-sm font-medium text-zinc-200">{c.competition_name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Quick links */}
            <div className="mt-8 flex items-center gap-4">
                <Link to="/standings" className="text-xs font-medium text-zinc-500 hover:text-amber-500 transition-colors">Classificações</Link>
                <span className="text-zinc-700">·</span>
                <Link to="/about" className="text-xs font-medium text-zinc-500 hover:text-amber-500 transition-colors">Sobre</Link>
            </div>

            <div className="mt-16 text-center">
                <p className="text-[10px] font-medium text-zinc-600">Dados da Federação Portuguesa de Basquetebol</p>
            </div>
        </div>
    )
}
