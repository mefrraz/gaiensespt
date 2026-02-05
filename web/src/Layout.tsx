import { useState, useEffect } from 'react'
import { Outlet, Link } from 'react-router-dom'
import { Sun, Moon, Instagram, Facebook, Info, Calendar, BarChart2, Download } from 'lucide-react'
import PWAInstallBanner from './components/PWAInstallBanner'
import BottomNav from './components/BottomNav'

function Layout() {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')

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
                        <div className="flex flex-col hidden sm:flex">
                            <span className="font-bold text-lg leading-tight tracking-tight text-zinc-900 dark:text-white">
                                GaiensesPT
                            </span>
                            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium group-hover:text-gaia-yellow transition-colors">
                                FC Gaia Basquetebol
                            </span>
                        </div>
                    </Link>

                    {/* Actions */}
                    <div className="flex items-center gap-1 md:gap-2">
                        <Link
                            to="/standings"
                            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-400 transition-colors"
                        >
                            <BarChart2 size={16} />
                            <span className="text-xs font-bold">Classificações</span>
                        </Link>

                        <Link
                            to="/games?view=agenda"
                            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100/50 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-900 dark:text-white transition-all border border-transparent hover:border-zinc-200 dark:hover:border-white/10"
                        >
                            <div className="text-gaia-yellow"><Calendar size={16} /></div>
                            <span className="text-xs font-bold">Jogos</span>
                        </Link>

                        <div className="w-px h-6 bg-zinc-200 dark:bg-white/10 mx-1 hidden sm:block"></div>

                        <Link
                            to="/about"
                            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-400 transition-colors flex"
                            aria-label="Sobre"
                        >
                            <Info size={18} />
                        </Link>

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
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-white/10 py-8">
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
                        <a href="https://www.facebook.com/fcgaia" target="_blank" rel="noopener noreferrer" className="hover:text-gaia-yellow transition-colors">
                            <Facebook size={20} />
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
