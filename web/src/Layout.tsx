import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Sun, Moon, Github, Home, Info, Calendar, BarChart2, Download, Users, Search } from 'lucide-react'
import PWAInstallBanner from './components/PWAInstallBanner'
import BottomNav from './components/BottomNav'
import { useClub } from './lib/ClubContext'

function Layout() {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')
    const location = useLocation()
    const { clubName, clubSlug } = useClub()
    const isClubPage = location.pathname.startsWith('/clube/')

    useEffect(() => { window.scrollTo(0, 0) }, [location.pathname])

    useEffect(() => {
        if (theme === 'dark') document.documentElement.classList.add('dark')
        else document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', theme)
    }, [theme])

    function isActive(path: string) {
        if (path === '/') return location.pathname === '/' || location.pathname === ''
        return location.pathname.startsWith(path)
    }

    const linkBase = 'hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-xs font-bold'
    const linkActive = 'bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white shadow-sm'
    const linkInactive = 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5'

    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-300 flex flex-col font-sans">
            <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-white/10 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to={isClubPage ? `/clube/${clubSlug}` : '/'} className="flex items-center gap-3 group shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm shadow-amber-500/20">
                            <span className="text-white font-black text-sm">D</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-sm sm:text-lg leading-tight tracking-tight text-zinc-900 dark:text-white">Dribly</span>
                            {isClubPage && clubName ? (
                                <span className="text-[8px] sm:text-[10px] uppercase tracking-widest text-amber-500 font-bold truncate max-w-[120px]">{clubName}</span>
                            ) : (
                                <span className="text-[8px] sm:text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Basquetebol</span>
                            )}
                        </div>
                    </Link>

                    <div className="flex items-center gap-1 md:gap-2">
                        {isClubPage && (
                            <>
                                <Link to={`/clube/${clubSlug}`} className={`${linkBase} ${isActive(`/clube/${clubSlug}`) && !location.pathname.includes('/jogos') && !location.pathname.includes('/equipas') ? linkActive : linkInactive}`}>
                                    <Home size={16} /><span>Início</span>
                                </Link>
                                <Link to={`/clube/${clubSlug}/jogos`} className={`${linkBase} ${isActive(`/clube/${clubSlug}/jogos`) ? linkActive : linkInactive}`}>
                                    <Calendar size={16} /><span>Jogos</span>
                                </Link>
                                <Link to={`/clube/${clubSlug}/equipas`} className={`${linkBase} ${isActive(`/clube/${clubSlug}/equipas`) ? linkActive : linkInactive}`}>
                                    <Users size={16} /><span>Equipas</span>
                                </Link>
                            </>
                        )}

                        <Link to="/" className={`${linkBase} ${isActive('/') && !isClubPage ? linkActive : linkInactive}`}>
                            <Search size={16} /><span>Clubes</span>
                        </Link>

                        <Link to="/standings" className={`${linkBase} ${isActive('/standings') ? linkActive : linkInactive}`}>
                            <BarChart2 size={16} /><span>Tabelas</span>
                        </Link>

                        <div className="w-px h-6 bg-zinc-200 dark:bg-white/10 mx-1 hidden sm:block" />

                        <Link to="/about" className={`p-2 rounded-full transition-colors flex ${isActive('/about') ? 'bg-zinc-100 dark:bg-white/10 text-zinc-800 dark:text-white' : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10'}`} aria-label="Sobre"><Info size={18} /></Link>
                        <Link to="/install" className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-white/10 text-amber-500 transition-colors flex" aria-label="Instalar"><Download size={18} /></Link>
                        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-400 transition-colors" aria-label="Toggle Theme">
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
                    <div className="flex gap-4">
                        <a href="https://github.com/mefrraz/gaiensespt" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition-colors"><Github size={20} /></a>
                    </div>
                </div>
            </footer>

            <BottomNav />
            <PWAInstallBanner />
        </div>
    )
}
export default Layout
