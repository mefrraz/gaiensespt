import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Search, ChevronRight, ChevronLeft, BarChart2, TrendingUp, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { GameCard } from '../components/GameCard'
import { useClub, type Club } from '../lib/ClubContext'
import { type Match } from '../components/types'

function normalize(s: string): string { return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim() }

const POPULAR_TEAMS = ['FC PORTO', 'SL Benfica', 'Sporting CP', 'FC GAIA', 'Ovarense', 'Belenenses', 'Academica Coimbra', 'Farense']
const FEATURED_CLUBS = ['FC PORTO', 'SL Benfica-B', 'Sporting CP', 'FC GAIA', 'Belenenses', 'Academica Coimbra']

interface Association { association_id: number; association_name: string }

function Landing() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<Club[]>([])
    const [showDropdown, setShowDropdown] = useState(false)
    const [selectedIdx, setSelectedIdx] = useState(-1)
    const [games, setGames] = useState<Match[]>([])
    const [gamesLoading, setGamesLoading] = useState(true)
    const [carouselScroll, setCarouselScroll] = useState(0)
    const [associations, setAssociations] = useState<Association[]>([])
    const [assoOffset, setAssoOffset] = useState(0)
    const carouselRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()
    const { clubs, loadClubs, favoriteClub } = useClub()

    const normalizedClubs = useMemo(() => clubs.map(c => ({ ...c, _n: normalize(c.search_name || c.name) })), [clubs])

    useEffect(() => { loadClubs() }, [loadClubs])

    useEffect(() => { supabase.from('games_2025_2026').select('*').or('equipa_casa.ilike.%PORTO%,equipa_casa.ilike.%Benfica%,equipa_casa.ilike.%Sporting%,equipa_casa.ilike.%GAIA%,equipa_casa.ilike.%Ovarense%,equipa_casa.ilike.%Belenenses%,equipa_casa.ilike.%Academica%,equipa_casa.ilike.%Farense%').neq('status','FINALIZADO').gte('data', new Date().toISOString().split('T')[0]).order('data',{ascending:true}).limit(20).then(({data})=>{if(data&&data.length>0){const d=data as Match[];setGames(d.filter(m=>POPULAR_TEAMS.some(t=>(m.equipa_casa+' '+m.equipa_fora).toUpperCase().includes(t.toUpperCase()))))}setGamesLoading(false)}) },[])

    useEffect(() => {
        supabase.from('competitions').select('association_id,association_name').eq('season','2025/2026').order('association_name').then(({data}) => {
            if (data) {
                const seen = new Map() as Map<number, Association>
                (data as Association[]).forEach((a: Association) => { if (!seen.has(a.association_id)) seen.set(a.association_id, a) })
                const uniq = Array.from(seen.values())
                const shuffled = uniq.sort(() => Math.random() - 0.5)
                setAssociations(shuffled as Association[])
            }
        })
    }, [])

    // Auto-scroll associations carousel every 2s
    useEffect(() => {
        if (associations.length === 0) return
        const id = setInterval(() => {
            setAssoOffset(prev => {
                const next = prev - 1
                const totalWidth = associations.length * 200
                return next < -totalWidth ? 0 : next
            })
        }, 40)
        return () => clearInterval(id)
    }, [associations.length])

    // Search effects
    useEffect(() => { if (!query.trim()) { setResults([]); setShowDropdown(false); setSelectedIdx(-1); return }; const q = normalize(query); setResults(normalizedClubs.filter(c => c._n.includes(q)).slice(0, 20)); setShowDropdown(true); setSelectedIdx(-1) }, [query, normalizedClubs])
    useEffect(() => { const f = (e: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) && inputRef.current && !inputRef.current.contains(e.target as Node)) setShowDropdown(false) }; document.addEventListener('mousedown', f); return () => document.removeEventListener('mousedown', f) }, [])

    const handleKeyDown = (e: React.KeyboardEvent) => { if (!showDropdown || results.length === 0) return; if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, results.length - 1)) } else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, -1)) } else if (e.key === 'Enter' && selectedIdx >= 0) { e.preventDefault(); selectClub(results[selectedIdx]) } else if (e.key === 'Escape') { setShowDropdown(false) } }

    const selectClub = (club: Club) => { navigate('/clube/' + club.slug + '/home'); setQuery(''); setShowDropdown(false) }
    const scrollCarousel = (dir: number) => { if (!carouselRef.current) return; carouselRef.current.scrollBy({ left: dir * 312, behavior: 'smooth' }); setTimeout(() => carouselRef.current && setCarouselScroll(carouselRef.current.scrollLeft), 400) }
    const maxScroll = carouselRef.current ? carouselRef.current.scrollWidth - carouselRef.current.clientWidth : 0

    return (
        <div className="pb-24">
            {/* Hero */}
            <div className="relative overflow-hidden bg-gradient-to-b from-dribly-purple/5 via-transparent to-transparent dark:from-dribly-purple/10 dark:via-transparent dark:to-transparent -mt-4 md:-mt-6">
                <div className="max-w-2xl mx-auto px-4 pt-16 md:pt-20 pb-10 text-center relative">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-dribly-purple/10 dark:bg-dribly-purple/20 text-dribly-purple text-[11px] font-bold uppercase tracking-wider mb-6 animate-fade-in"><span className="w-1.5 h-1.5 rounded-full bg-dribly-purple animate-pulse" />Época 2025/2026</div>
                    <h1 className="text-3xl md:text-5xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight mb-2 animate-slide-up">Dribly<span className="text-dribly-purple">.</span></h1>
                    <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed mb-6 animate-slide-up">Resultados de todos os clubes de basquetebol em Portugal</p>
                    <div className="flex flex-wrap justify-center gap-2 mb-6 animate-slide-up">{FEATURED_CLUBS.map(name => { const c = clubs.find(x => name.toLowerCase().includes(x.name.toLowerCase().substring(0, 4))); if (!c) return null; return (<button key={c.slug} onClick={() => selectClub(c)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:border-dribly-purple/30 hover:text-dribly-purple hover:shadow-sm transition-all"><span className="w-5 h-5 rounded-full bg-dribly-purple/10 dark:bg-dribly-purple/20 flex items-center justify-center text-[9px] font-bold text-dribly-purple shrink-0">{name.charAt(0).toUpperCase()}</span>{name}</button>) })}</div>
                    <div className="max-w-lg mx-auto relative animate-slide-up" ref={dropdownRef}><div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none"><Search size={20} className="text-zinc-400" /></div><input ref={inputRef} type="text" value={query} onChange={e => { setQuery(e.target.value); setSelectedIdx(-1) }} onKeyDown={handleKeyDown} onFocus={() => query.trim() && setShowDropdown(true)} placeholder="Pesquisar clube..." className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 outline-none shadow-lg shadow-zinc-200/50 dark:shadow-black/20 transition-all focus:ring-2 focus:ring-dribly-purple/30 focus:border-dribly-purple" />{showDropdown && results.length > 0 && (<div className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden z-50 text-left max-h-80 overflow-y-auto">{results.map((club,i) => (<button key={club.slug} onClick={() => selectClub(club)} className={'w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ' + (selectedIdx === i ? 'bg-dribly-purple/10 dark:bg-dribly-purple/20' : 'hover:bg-zinc-50 dark:hover:bg-white/5')}><div className="w-9 h-9 rounded-full bg-dribly-purple/10 dark:bg-dribly-purple/20 flex items-center justify-center shrink-0"><span className="text-xs font-bold text-dribly-purple">{club.name.charAt(0).toUpperCase()}</span></div><span className="text-sm font-medium text-zinc-900 dark:text-white truncate">{club.name}</span></button>))}</div>)}</div>
                    {favoriteClub && (<Link to={'/clube/' + favoriteClub.slug + '/home'} className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-full bg-dribly-purple/5 dark:bg-dribly-purple/10 text-dribly-purple text-xs font-bold border border-dribly-purple/20 hover:bg-dribly-purple/10 dark:hover:bg-dribly-purple/20 transition-all group animate-slide-up"><HomeIcon size={14} /><span>Continuar com {favoriteClub.name}</span><ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" /></Link>)}
                </div>
            </div>

            {/* Stats */}
            <div className="bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-white/5"><div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-center gap-6 md:gap-16"><div className="text-center"><span className="text-lg font-black text-zinc-900 dark:text-white">79</span><p className="text-[10px] text-zinc-500 uppercase tracking-wide mt-0.5">Clubes</p></div><div className="w-px h-8 bg-zinc-200 dark:bg-white/10" /><div className="text-center"><span className="text-lg font-black text-zinc-900 dark:text-white">411</span><p className="text-[10px] text-zinc-500 uppercase tracking-wide mt-0.5">Competições</p></div><div className="w-px h-8 bg-zinc-200 dark:bg-white/10" /><div className="text-center"><span className="text-lg font-black text-zinc-900 dark:text-white">24</span><p className="text-[10px] text-zinc-500 uppercase tracking-wide mt-0.5">Associações</p></div></div></div>

            {/* Jogos em Destaque — gradient fades both sides, wider cards */}
            <div className="py-8">
                <div className="max-w-2xl mx-auto px-4 mb-4"><div className="flex items-center justify-between"><h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-dribly-purple animate-pulse" />Jogos em Destaque</h2><div className="flex gap-1"><button onClick={() => scrollCarousel(-1)} disabled={carouselScroll === 0} className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 disabled:opacity-30 transition-colors"><ChevronLeft size={16} /></button><button onClick={() => scrollCarousel(1)} disabled={carouselScroll >= maxScroll} className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 disabled:opacity-30 transition-colors"><ChevronRight size={16} /></button></div></div></div>
                <div className="max-w-2xl mx-auto px-4 relative">
                    {gamesLoading ? (<div className="flex gap-3 overflow-hidden">{[1,2,3].map(i => <div key={i} className="min-w-[320px] h-48 rounded-2xl bg-zinc-100 dark:bg-zinc-900 animate-pulse shrink-0" />)}</div>) : games.length === 0 ? (<p className="text-xs text-zinc-400 text-center py-8">Nenhum jogo em destaque de momento.</p>) : (<div className="relative"><div className="absolute left-0 top-0 bottom-2 w-12 bg-gradient-to-r from-zinc-50 dark:from-zinc-950 to-transparent pointer-events-none z-10" /><div ref={carouselRef} onScroll={() => carouselRef.current && setCarouselScroll(carouselRef.current.scrollLeft)} className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">{games.map(match => (<div key={match.slug || match.id} className="min-w-[320px] shrink-0"><GameCard match={match} mode="agenda" /></div>))}</div><div className="absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-zinc-50 dark:from-zinc-950 to-transparent pointer-events-none z-10" /></div>)}
                </div>
            </div>

            {/* Associations carousel — infinite auto-scroll */}
            <div className="py-8 bg-white dark:bg-zinc-950 border-t border-b border-zinc-100 dark:border-white/5">
                <div className="mb-5 px-4 text-center">
                    <h2 className="text-sm font-bold text-zinc-900 dark:text-white inline-flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-dribly-purple animate-pulse" />Associações de Basquetebol</h2>
                </div>
                {associations.length > 0 ? (
                    <div className="relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white dark:from-zinc-950 to-transparent pointer-events-none z-10" />
                        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white dark:from-zinc-950 to-transparent pointer-events-none z-10" />
                        <div className="flex gap-4 py-2" style={{ transform: 'translateX(' + assoOffset + 'px)', transition: 'none', width: (associations.length * 2 * 132) + 'px' }}>
                            {[...associations, ...associations].map((a, i) => (
                                <Link key={a.association_id + '-' + i} to={'/standings/' + a.association_id} className="w-[100px] h-[100px] shrink-0 rounded-2xl flex items-center justify-center overflow-hidden hover:scale-105 transition-transform duration-300 shadow-sm" style={{ backgroundColor: ["#7C3AED","#3B82F6","#059669","#DC2626","#EA580C","#CA8A04","#0891B2","#9333EA","#4F46E5","#0D9488","#DB2777"][a.association_id % 11] }}>
                                    <span className="text-white font-black text-lg">{a.association_name.replace('AB ','').substring(0,3).toUpperCase()}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                ) : null}
                <div className="text-center mt-6">
                    <Link to="/standings" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-dribly-purple text-white text-sm font-bold hover:bg-dribly-purple-dim transition-colors shadow-sm group">Ver todas as classificações<ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" /></Link>
                </div>
            </div>

            {/* Data info */}
            <div className="max-w-2xl mx-auto px-4 py-8 text-center">
                <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-4">Dados disponiveis</h2>
                <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
                    <span className="px-3 py-1.5 rounded-full bg-dribly-purple/10 dark:bg-dribly-purple/20 text-dribly-purple text-xs font-bold">79 clubes</span>
                    <span className="px-3 py-1.5 rounded-full bg-dribly-purple/10 dark:bg-dribly-purple/20 text-dribly-purple text-xs font-bold">411 competicoes</span>
                    <span className="px-3 py-1.5 rounded-full bg-dribly-purple/10 dark:bg-dribly-purple/20 text-dribly-purple text-xs font-bold">23 associacoes</span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
                    Os dados sao obtidos diretamente do site da FPB e atualizados sempre que abres o Dribly.
                </p>
            </div>

            {/* Quick Links */}
            <div className="max-w-2xl mx-auto px-4 py-4"><div className="grid grid-cols-2 gap-3"><Link to="/standings" className="glass-card p-4 flex items-center gap-3 hover:border-dribly-purple/20 group"><div className="w-10 h-10 rounded-xl bg-dribly-purple/10 dark:bg-dribly-purple/20 flex items-center justify-center shrink-0"><BarChart2 size={20} className="text-dribly-purple" /></div><div><h3 className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-dribly-purple transition-colors">Classificações</h3><p className="text-[10px] text-zinc-500">Consultar tabelas</p></div></Link><Link to="/about" className="glass-card p-4 flex items-center gap-3 hover:border-dribly-purple/20 group"><div className="w-10 h-10 rounded-xl bg-dribly-purple/10 dark:bg-dribly-purple/20 flex items-center justify-center shrink-0"><TrendingUp size={20} className="text-dribly-purple" /></div><div><h3 className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-dribly-purple transition-colors">Sobre</h3><p className="text-[10px] text-zinc-500">Como funciona</p></div></Link></div></div>
        </div>
    )
}

function HomeIcon({ size, className }: { size: number; className?: string }) { return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>) }

export default Landing