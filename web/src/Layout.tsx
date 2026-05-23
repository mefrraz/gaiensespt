import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { Sun, Moon, Home, Calendar, Search, X } from 'lucide-react'
import PWAInstallBanner from './components/PWAInstallBanner'
import BottomNav from './components/BottomNav'
import { useClub } from './lib/ClubContext'
import { supabase } from './lib/supabase'

function Layout() {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')
    const location = useLocation()
    const navigate = useNavigate()
    const { clubName, clubSlug } = useClub()
    const isClubPage = location.pathname.startsWith('/clube/')

    const [searchOpen, setSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<{ id: number; name: string; slug: string }[]>([])

    const selectedClub = localStorage.getItem('dribly-selected-club')
    const selectedClubName = localStorage.getItem('dribly-selected-club-name')

    useEffect(() => { window.scrollTo(0, 0) }, [location.pathname])
    useEffect(() => {
        if (theme === 'dark') document.documentElement.classList.add('dark')
        else document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', theme)
    }, [theme])

    useEffect(() => {
        if (searchQuery.length < 1) { setSearchResults([]); return }
        const t = setTimeout(async () => {
            const { data } = await supabase.from('clubs').select('id, name, slug').ilike('search_name', `%${searchQuery}%`).limit(6)
            if (data) setSearchResults(data as any[])
        }, 200)
        return () => clearTimeout(t)
    }, [searchQuery])

    function selectClub(slug: string, name: string) {
        localStorage.setItem('dribly-selected-club', slug)
        localStorage.setItem('dribly-selected-club-name', name)
        setSearchOpen(false)
        setSearchQuery('')
        navigate(`/clube/${slug}`)
    }

    const navLink = 'hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-xs font-bold'
    const navActive = 'bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white shadow-sm'
    const navInactive = 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5'

    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-300 flex flex-col font-sans">
            <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-white/10 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm shadow-violet-600/20">
                            <span className="text-white font-black text-sm">D</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-sm sm:text-lg leading-tight tracking-tight text-zinc-900 dark:text-white">Dribly</span>
                            {isClubPage && clubName ? (
                                <span className="text-[8px] sm:text-[10px] uppercase tracking-widest text-violet-600 font-medium truncate max-w-[120px]">{clubName}</span>
                            ) : selectedClubName ? (
                                <span className="text-[8px] sm:text-[10px] uppercase tracking-widest text-zinc-500 font-medium truncate max-w-[120px]">{selectedClubName}</span>
                            ) : (
                                <span className="text-[8px] sm:text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Basquetebol</span>
                            )}
                        </div>
                    </Link>

                    <div className="flex items-center gap-1 md:gap-2">
                        {isClubPage && clubSlug && (
                            <>
                                <Link to={`/clube/${clubSlug}`} className={`${navLink} ${location.pathname === `/clube/${clubSlug}` ? navActive : navInactive}`}>
                                    <Home size={16} /><span>Meu Clube</span>
                                </Link>
                                <Link to={`/clube/${clubSlug}/jogos`} className={`${navLink} ${location.pathname.includes('/jogos') ? navActive : navInactive}`}>
                                    <Calendar size={16} /><span>Jogos</span>
                                </Link>
                            </>
                        )}
                        {selectedClub && !isClubPage && (
                            <>
                                <Link to={`/clube/${selectedClub}`} className={`${navLink} ${navInactive}`}>
                                    <Home size={16} /><span>Meu Clube</span>
                                </Link>
                                <Link to={`/clube/${selectedClub}/jogos`} className={`${navLink} ${navInactive}`}>
                                    <Calendar size={16} /><span>Jogos</span>
                                </Link>
                            </>
                        )}

                        <button onClick={() => setSearchOpen(true)}
                            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-violet-600 hover:bg-zinc-100 dark:hover:bg-white/5 transition-all">
                            <Search size={14} />Clubes
                        </button>

                        <div className="w-px h-6 bg-zinc-200 dark:bg-white/10 mx-1 hidden sm:block" />

                        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-400 transition-colors">
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                    </div>
                </div>
            </nav>

            <main className="flex-grow p-4 md:p-8 pb-24"><Outlet /></main>

            <footer className="hidden md:block bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-white/10 py-8">
                <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-zinc-500">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-900 dark:text-white">Dribly</span>
                        <span className="text-zinc-400">·</span>
                        <span>&copy; {new Date().getFullYear()}</span>
                    </div>
                </div>
            </footer>

            <BottomNav />
            <PWAInstallBanner />

            {/* Club Search Overlay */}
            {searchOpen && (
                <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-24 px-4" onClick={() => setSearchOpen(false)}>
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md p-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-2 mb-3">
                            <Search size={16} className="text-zinc-400 shrink-0" />
                            <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Pesquisar clube..."
                                className="flex-1 bg-transparent text-sm outline-none placeholder-zinc-400" />
                            <button onClick={() => setSearchOpen(false)} className="p-1 text-zinc-400 hover:text-zinc-600"><X size={16} /></button>
                        </div>
                        {searchResults.length > 0 && (
                            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {searchResults.map(c => (
                                    <button key={c.id} onClick={() => selectClub(c.slug, c.name)}
                                        className="w-full text-left px-2 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center text-[10px] font-bold text-violet-600">
                                            {c.name.charAt(0)}
                                        </div>
                                        <span className="text-sm font-medium">{c.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                        {searchQuery.length >= 1 && searchResults.length === 0 && (
                            <p className="text-xs text-zinc-400 py-4 text-center">Nenhum clube encontrado</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
export default Layout
