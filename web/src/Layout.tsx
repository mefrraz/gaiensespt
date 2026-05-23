import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Sun, Moon, Instagram, Github, Home, Info, Calendar, BarChart2, Download } from 'lucide-react'
import PWAInstallBanner from './components/PWAInstallBanner'
import BottomNav from './components/BottomNav'
import { useGames } from './hooks/useGames'
import { GameDataContext } from './lib/GameDataContext'

function Layout() {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')
    const location = useLocation()

    const { games, loading, lastUpdated, error, refresh } = useGames('2025/2026', 119)

    useEffect(() => { window.scrollTo(0, 0) }, [location.pathname])

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
        localStorage.setItem('theme', theme)
    }, [theme])

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark')
    }

    function isActive(path: string) {
        if (path === '/') return location.pathname === '/'
        return location.pathname.startsWith(path)
    }

    const linkBase = 'hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-xs font-bold'
    const linkActive = 'bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white shadow-sm'
    const linkInactive = 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5'

    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-300 flex flex-col font-sans">

            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-white/10 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">

                    {/* Logo & Brand */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <img
                            src="/logo.png"
                            alt="GaiensesPT Logo"
                            className="h-10 w-auto group-hover:scale-110 transition-transform duration-300 drop-shadow-md"
                        />
                        <div className="flex flex-col">
                            <span className="font-bold text-sm sm:text-lg leading-tight tracking-tight text-zinc-900 dark:text-white">
                                GaiensesPT
                            </span>
                            <span className="text-[8px] sm:text-[10px] uppercase tracking-widest text-zinc-500 font-medium group-hover:text-gaia-yellow transition-colors">
                                FC Gaia Basquetebol
                            </span>
                        </div>
                    </Link>

                    {/* Actions */}
                    <div className="flex items-center gap-1 md:gap-2">
                        <Link to="/" className={`${linkBase} ${isActive('/') ? linkActive : linkInactive}`}>
                            <Home size={16} />
                            <span>Início</span>
                        </Link>

                        <Link to="/standings" className={`${linkBase} ${isActive('/standings') ? linkActive : linkInactive}`}>
                            <BarChart2 size={16} />
                            <span>Classificações</span>
                        </Link>

                        <Link to="/games?view=agenda" className={`${linkBase} ${isActive('/games') ? linkActive : linkInactive}`}>
                            <Calendar size={16} />
                            <span>Jogos</span>
                        </Link>

                        <div className="w-px h-6 bg-zinc-200 dark:bg-white/10 mx-1 hidden sm:block"></div>

                        <Link to="/about" className={`p-2 rounded-full transition-colors flex ${isActive('/about') ? 'bg-zinc-100 dark:bg-white/10 text-zinc-800 dark:text-white' : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10'}`}
                            aria-label="Sobre"><Info size={18} /></Link>

                        <Link
                            to="/install"
                            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-white/10 text-gaia-yellow transition-colors flex"
                            aria-label="Instalar"
                        >
                            <Download size={18} />
                        </Link>

                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-400 transition-colors"
                            aria-label="Toggle Theme"
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow p-4 md:p-8 pb-24">
                <GameDataContext.Provider value={{ games, loading, lastUpdated, error, refresh }}>
                    <Outlet />
                </GameDataContext.Provider>
            </main>

            {/* Footer */}
            <footer className="hidden md:block bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-white/10 py-8">
                <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-zinc-500">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-900 dark:text-white">GaiensesPT</span>
                        <span className="text-zinc-400">•</span>
                        <span>&copy; {new Date().getFullYear()}</span>
                    </div>
                    <div className="flex gap-4">
                        <a href="https://www.instagram.com/gaiensespt" target="_blank" rel="noopener noreferrer" className="hover:text-gaia-yellow transition-colors">
                            <Instagram size={20} />
                        </a>
                        <a href="https://github.com/mefrraz/gaiensespt" target="_blank" rel="noopener noreferrer" className="hover:text-gaia-yellow transition-colors">
                            <Github size={20} />
                        </a>
                    </div>
                </div>
            </footer>

            {/* Bottom Navigation - Mobile Only */}
            <BottomNav />

            {/* PWA Install Banner - Mobile Only */}
            <PWAInstallBanner />

        </div>
    )
}

export default Layout
