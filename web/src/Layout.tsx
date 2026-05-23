import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Sun, Moon, Instagram, Github, Info, BarChart2, Search, Home, Calendar, Users } from 'lucide-react'
import PWAInstallBanner from './components/PWAInstallBanner'
import BottomNav from './components/BottomNav'
import { SearchModal } from './components/SearchModal'
import { useClub, useClubColor } from './lib/ClubContext'

function Layout() {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')
    const [searchOpen, setSearchOpen] = useState(false)
    const location = useLocation()
    const { favoriteClub, selectedClub } = useClub()
    const clubColor = useClubColor()

    const activeClub = selectedClub || favoriteClub

    useEffect(() => { window.scrollTo(0, 0) }, [location.pathname])

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
        localStorage.setItem('theme', theme)
    }, [theme])

    const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

    function isActive(path: string) {
        if (path === '/') return location.pathname === '/'
        return location.pathname.startsWith(path)
    }

    const navPill = 'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all'
    const navPillInactive = 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-700 dark:hover:text-zinc-200'
    const navIcon = 'p-2 rounded-full transition-colors'

    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-300 flex flex-col font-sans">

            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-white/10 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-3">

                    {/* Logo & Brand */}
                    <Link to="/" className="flex items-center gap-2.5 group shrink-0 mr-1">
                        <div
                            className="w-9 h-9 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md"
                            style={{ backgroundColor: activeClub ? clubColor : '#2563EB', boxShadow: `0 4px 12px ${activeClub ? clubColor : '#2563EB'}40` }}
                        >
                            <span className="text-white font-black text-base">D</span>
                        </div>
                        <span className="hidden sm:inline font-bold text-sm text-zinc-900 dark:text-white transition-colors"
                            style={activeClub ? {} : { color: '' }}>
                            Dribly
                        </span>
                    </Link>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                        {/* Search chip */}
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border"
                            style={
                                activeClub
                                    ? { borderColor: clubColor + '40', backgroundColor: clubColor + '10', color: clubColor }
                                    : { borderColor: '', color: '' }
                            }
                        >
                            <Search size={14} />
                            {activeClub ? (
                                <span className="max-w-[100px] truncate hidden sm:inline">{activeClub.name}</span>
                            ) : (
                                <span className="hidden sm:inline text-zinc-500 dark:text-zinc-400">Pesquisar</span>
                            )}
                        </button>

                        {/* Início */}
                        {activeClub && (
                            <Link
                                to={`/clube/${activeClub.slug}/home`}
                                className={`${navPill} hidden sm:flex ${isActive(`/clube/${activeClub.slug}/home`) ? '' : navPillInactive}`}
                                style={isActive(`/clube/${activeClub.slug}/home`) ? { backgroundColor: clubColor, color: '#fff', boxShadow: `0 4px 12px ${clubColor}40` } : {}}
                            >
                                <Home size={14} />
                                <span>Início</span>
                            </Link>
                        )}

                        {/* Jogos */}
                        {activeClub && (
                            <Link
                                to={`/clube/${activeClub.slug}/games`}
                                className={`${navPill} hidden sm:flex ${isActive(`/clube/${activeClub.slug}/games`) ? '' : navPillInactive}`}
                                style={isActive(`/clube/${activeClub.slug}/games`) ? { backgroundColor: clubColor, color: '#fff', boxShadow: `0 4px 12px ${clubColor}40` } : {}}
                            >
                                <Calendar size={14} />
                                <span>Jogos</span>
                            </Link>
                        )}

                        {/* Equipas */}
                        {activeClub && (
                            <Link
                                to={`/clube/${activeClub.slug}/team`}
                                className={`${navPill} hidden sm:flex ${isActive(`/clube/${activeClub.slug}/team`) ? '' : navPillInactive}`}
                                style={isActive(`/clube/${activeClub.slug}/team`) ? { backgroundColor: clubColor, color: '#fff', boxShadow: `0 4px 12px ${clubColor}40` } : {}}
                            >
                                <Users size={14} />
                                <span>Equipas</span>
                            </Link>
                        )}

                        {/* Classificações */}
                        <Link
                            to="/standings"
                            className={`${navPill} hidden sm:flex ${isActive('/standings') ? '' : navPillInactive}`}
                            style={isActive('/standings') ? { backgroundColor: activeClub ? clubColor : '#2563EB', color: '#fff', boxShadow: `0 4px 12px ${activeClub ? clubColor : '#2563EB'}40` } : {}}
                        >
                            <BarChart2 size={14} />
                            <span>Classificações</span>
                        </Link>

                        {/* Sobre */}
                        <Link
                            to="/about"
                            className={`${navPill} hidden sm:flex ${isActive('/about') ? '' : navPillInactive}`}
                            style={isActive('/about') ? { backgroundColor: activeClub ? clubColor : '#2563EB', color: '#fff', boxShadow: `0 4px 12px ${activeClub ? clubColor : '#2563EB'}40` } : {}}
                        >
                            <Info size={14} />
                            <span>Sobre</span>
                        </Link>

                        {/* Theme toggle */}
                        <button onClick={toggleTheme} className={`${navIcon} text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5`}
                            aria-label="Tema">
                            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
                        </button>

                        {/* Mobile-only compact actions */}
                        <div className="flex sm:hidden items-center gap-0.5">
                            <Link to="/standings" className={`${navIcon} ${isActive('/standings') ? '' : 'text-zinc-400'}`}
                                style={isActive('/standings') ? { color: clubColor } : {}}
                                aria-label="Classificações">
                                <BarChart2 size={18} />
                            </Link>
                            <Link to="/about" className={`${navIcon} ${isActive('/about') ? '' : 'text-zinc-400'}`}
                                style={isActive('/about') ? { color: clubColor } : {}}
                                aria-label="Sobre">
                                <Info size={18} />
                            </Link>
                            <button onClick={toggleTheme} className={`${navIcon} text-zinc-400`}
                                aria-label="Tema">
                                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow pt-4 md:pt-6 pb-24">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="hidden md:block bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-white/10 py-8">
                <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-zinc-500">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-900 dark:text-white">Dribly</span>
                        <span className="text-zinc-400">•</span>
                        <span>&copy; {new Date().getFullYear()}</span>
                    </div>
                    <div className="flex gap-4">
                        <a href="https://www.instagram.com/gaiensespt" target="_blank" rel="noopener noreferrer" className="transition-colors"
                            style={{ ':hover': { color: clubColor } } as React.CSSProperties}>
                            <Instagram size={20} className="hover:text-[var(--club-color)] transition-colors" />
                        </a>
                        <a href="https://github.com/mefrraz/gaiensespt" target="_blank" rel="noopener noreferrer" className="transition-colors">
                            <Github size={20} className="hover:text-[var(--club-color)] transition-colors" />
                        </a>
                    </div>
                </div>
            </footer>

            {/* Bottom Navigation - Mobile Only */}
            <BottomNav />

            {/* PWA Install Banner - Mobile Only */}
            <PWAInstallBanner />

            {/* Search Modal */}
            <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

        </div>
    )
}

export default Layout
