import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Sun, Moon, Instagram, Github, Info, BarChart2, Search, Home, Calendar } from 'lucide-react'
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
    const navPillActive = 'bg-dribly-purple text-white shadow-sm'
    const navPillInactive = 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-700 dark:hover:text-zinc-200'
    const navIcon = 'p-2 rounded-full transition-colors'

    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-300 flex flex-col font-sans">

            {/* Navbar — transparent on scroll via backdrop-blur */}
            <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-white/10 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-2">

                    {/* Logo — icon + "dribly." text */}
                    <Link to="/" className="flex items-center gap-2.5 group shrink-0 mr-1">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                            <img src="/logo.svg" alt="Dribly" className="w-full h-full object-contain" />
                        </div>
                        <span className="hidden sm:flex items-baseline font-bold text-sm text-zinc-900 dark:text-zinc-100">
                            dribly<span className="text-dribly-purple">.</span>
                        </span>
                    </Link>

                    {/* LEFT navigation */}
                    <div className="flex items-center gap-1 ml-1">
                        <Link to="/" className={`${navPill} ${isActive('/') && !activeClub ? navPillActive : navPillInactive}`}>
                            <Home size={14} />
                            <span className="hidden sm:inline">Início</span>
                        </Link>
                        {activeClub && (
                            <Link to={`/clube/${activeClub.slug}/home`} className={`${navPill} ${isActive(`/clube/${activeClub.slug}/home`) ? navPillActive : navPillInactive}`}>
                                <Home size={14} />
                                <span className="hidden sm:inline">Meu Clube</span>
                            </Link>
                        )}
                        {activeClub && (
                            <Link to={`/clube/${activeClub.slug}/games`} className={`${navPill} ${isActive(`/clube/${activeClub.slug}/games`) ? navPillActive : navPillInactive}`}>
                                <Calendar size={14} />
                                <span className="hidden sm:inline">Jogos</span>
                            </Link>
                        )}
                        <Link to="/standings" className={`${navPill} ${isActive('/standings') ? navPillActive : navPillInactive}`}>
                            <BarChart2 size={14} />
                            <span className="hidden sm:inline">Classificações</span>
                        </Link>
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* RIGHT side */}
                    <div className="flex items-center gap-1">
                        <button onClick={() => setSearchOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-white/20 hover:bg-zinc-100 dark:hover:bg-white/5">
                            <Search size={14} />
                            {activeClub ? (
                                <span className="max-w-[100px] truncate hidden sm:inline">{activeClub.name}</span>
                            ) : (
                                <span className="hidden sm:inline">Pesquisar</span>
                            )}
                        </button>
                        <Link to="/about" className={`${navPill} ${isActive('/about') ? navPillActive : navPillInactive}`}>
                            <Info size={14} />
                            <span className="hidden sm:inline">Sobre</span>
                        </Link>
                        <button onClick={toggleTheme} className={`${navIcon} text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5`} aria-label="Tema">
                            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
                        </button>
                        <div className="flex sm:hidden items-center gap-0.5">
                            <Link to="/standings" className={`${navIcon} ${isActive('/standings') ? 'text-dribly-purple' : 'text-zinc-400'}`} aria-label="Classificações">
                                <BarChart2 size={18} />
                            </Link>
                            <Link to="/about" className={`${navIcon} ${isActive('/about') ? 'text-dribly-purple' : 'text-zinc-400'}`} aria-label="Sobre">
                                <Info size={18} />
                            </Link>
                            <button onClick={toggleTheme} className={`${navIcon} text-zinc-400`} aria-label="Tema">
                                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-grow pt-4 md:pt-6 pb-24">
                <Outlet />
            </main>

            <footer className="hidden md:block bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-white/10 py-8">
                <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-zinc-500">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-900 dark:text-white">Dribly</span>
                        <span className="text-zinc-400">•</span>
                        <span>&copy; {new Date().getFullYear()}</span>
                    </div>
                    <div className="flex gap-4">
                        <a href="https://www.instagram.com/gaiensespt" target="_blank" rel="noopener noreferrer" className="hover:text-dribly-purple transition-colors">
                            <Instagram size={20} />
                        </a>
                        <a href="https://github.com/mefrraz/gaiensespt" target="_blank" rel="noopener noreferrer" className="hover:text-dribly-purple transition-colors">
                            <Github size={20} />
                        </a>
                    </div>
                </div>
            </footer>

            <BottomNav />
            <PWAInstallBanner />
            <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </div>
    )
}

export default Layout
