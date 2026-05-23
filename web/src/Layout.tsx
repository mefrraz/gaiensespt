import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Sun, Moon, Instagram, Github, Info, BarChart2, Download, Search, Home, Calendar } from 'lucide-react'
import PWAInstallBanner from './components/PWAInstallBanner'
import BottomNav from './components/BottomNav'
import { SearchModal } from './components/SearchModal'
import { useClub } from './lib/ClubContext'

function Layout() {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')
    const [searchOpen, setSearchOpen] = useState(false)
    const location = useLocation()
    const { favoriteClub, selectedClub } = useClub()

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
    const navPillActive = 'bg-dribly-blue text-white shadow-md shadow-blue-500/20'
    const navPillInactive = 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-700 dark:hover:text-zinc-200'
    const navIcon = 'p-2 rounded-full transition-colors'

    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-300 flex flex-col font-sans">

            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-white/10 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-3">

                    {/* Logo & Brand */}
                    <Link to="/" className="flex items-center gap-2.5 group shrink-0 mr-1">
                        <img
                            src="/logo.svg"
                            alt="Dribly"
                            className="h-9 w-auto group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="hidden sm:flex flex-col">
                            <span className="font-bold text-sm leading-tight tracking-tight text-zinc-900 dark:text-white">
                                Dribly
                            </span>
                            <span className="text-[8px] uppercase tracking-widest text-zinc-400 font-medium group-hover:text-dribly-blue transition-colors">
                                Basquetebol PT
                            </span>
                        </div>
                    </Link>

                    {/* Spacer - pushes actions to right */}
                    <div className="flex-1" />

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                        {/* Search chip — shows club name if selected */}
                        <button
                            onClick={() => setSearchOpen(true)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                activeClub
                                    ? 'border-dribly-blue/30 bg-dribly-blue/5 dark:bg-dribly-blue/10 text-dribly-blue hover:border-dribly-blue/50'
                                    : 'border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-white/20 hover:bg-zinc-100 dark:hover:bg-white/5'
                            }`}
                        >
                            <Search size={14} />
                            {activeClub ? (
                                <span className="max-w-[100px] truncate hidden sm:inline">{activeClub.name}</span>
                            ) : (
                                <span className="hidden sm:inline">Pesquisar</span>
                            )}
                        </button>

                        {/* Meu Clube — only if club selected */}
                        {activeClub && (
                            <Link
                                to={`/clube/${activeClub.slug}/home`}
                                className={`${navPill} hidden sm:flex ${isActive(`/clube/${activeClub.slug}/home`) ? navPillActive : navPillInactive}`}
                            >
                                <Home size={14} />
                                <span>Meu Clube</span>
                            </Link>
                        )}

                        {/* Jogos — only if club selected */}
                        {activeClub && (
                            <Link
                                to={`/clube/${activeClub.slug}/games`}
                                className={`${navPill} hidden sm:flex ${isActive(`/clube/${activeClub.slug}/games`) ? navPillActive : navPillInactive}`}
                            >
                                <Calendar size={14} />
                                <span>Jogos</span>
                            </Link>
                        )}

                        {/* Classificações */}
                        <Link
                            to="/standings"
                            className={`${navPill} hidden sm:flex ${isActive('/standings') ? navPillActive : navPillInactive}`}
                        >
                            <BarChart2 size={14} />
                            <span>Classificações</span>
                        </Link>

                        {/* Icon-only actions */}
                        <div className="hidden sm:flex items-center gap-0.5 ml-1">
                            <Link to="/about" className={`${navIcon} ${isActive('/about') ? 'text-dribly-blue bg-dribly-blue/10' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5'}`}
                                aria-label="Sobre">
                                <Info size={17} />
                            </Link>
                            <Link to="/install" className={`${navIcon} text-dribly-blue hover:bg-dribly-blue/10 transition-colors`}
                                aria-label="Instalar">
                                <Download size={17} />
                            </Link>
                            <button onClick={toggleTheme} className={`${navIcon} text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5`}
                                aria-label="Tema">
                                {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
                            </button>
                        </div>

                        {/* Mobile-only compact actions */}
                        <div className="flex sm:hidden items-center gap-0.5">
                            <Link to="/standings" className={`${navIcon} ${isActive('/standings') ? 'text-dribly-blue' : 'text-zinc-400'}`}
                                aria-label="Classificações">
                                <BarChart2 size={18} />
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
            <main className="flex-grow pb-24">
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
                        <a href="https://www.instagram.com/gaiensespt" target="_blank" rel="noopener noreferrer" className="hover:text-dribly-blue transition-colors">
                            <Instagram size={20} />
                        </a>
                        <a href="https://github.com/mefrraz/gaiensespt" target="_blank" rel="noopener noreferrer" className="hover:text-dribly-blue transition-colors">
                            <Github size={20} />
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
