import { useState, useEffect, useRef } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { Sun, Moon, Instagram, Github, Info, Calendar, BarChart2, Download } from 'lucide-react'
import PWAInstallBanner from './components/PWAInstallBanner'
import BottomNav from './components/BottomNav'

function Layout() {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')
    const location = useLocation()
    const navigate = useNavigate()
    const touchStartX = useRef(0)
    const touchStartY = useRef(0)
    const contentRef = useRef<HTMLDivElement>(null)
    const isSwiping = useRef(false)

    const pages = ['/', '/games', '/standings']
    const isSwipePage = pages.includes(location.pathname)
    const currentIndex = pages.indexOf(location.pathname)

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX
        touchStartY.current = e.touches[0].clientY
        isSwiping.current = false
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isSwipePage || !contentRef.current || !touchStartX.current) return
        const deltaX = e.touches[0].clientX - touchStartX.current
        const deltaY = e.touches[0].clientY - touchStartY.current

        if (!isSwiping.current) {
            if (Math.abs(deltaY) > Math.abs(deltaX) || Math.abs(deltaX) < 10) return
            isSwiping.current = true
        }

        if (deltaX > 0 && currentIndex <= 0) {
            contentRef.current.style.transform = `translateX(${deltaX * 0.2}px)`
            contentRef.current.style.transition = 'none'
            return
        }
        if (deltaX < 0 && currentIndex >= pages.length - 1) {
            contentRef.current.style.transform = `translateX(${deltaX * 0.2}px)`
            contentRef.current.style.transition = 'none'
            return
        }

        contentRef.current.style.transform = `translateX(${deltaX}px)`
        contentRef.current.style.transition = 'none'
    }

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!isSwipePage || !contentRef.current || !touchStartX.current) return
        const deltaX = e.changedTouches[0].clientX - touchStartX.current
        touchStartX.current = 0
        isSwiping.current = false

        if (Math.abs(deltaX) > 50) {
            const direction = deltaX > 0 ? 1 : -1
            const targetIndex = direction > 0 ? currentIndex - 1 : currentIndex + 1
            if (targetIndex < 0 || targetIndex >= pages.length) {
                contentRef.current.style.transition = 'transform 0.25s ease-out'
                contentRef.current.style.transform = 'translateX(0px)'
                return
            }
            contentRef.current.style.transition = 'transform 0.15s ease-out'
            contentRef.current.style.transform = `translateX(${direction * window.innerWidth}px)`
            setTimeout(() => navigate(pages[targetIndex]), 150)
        } else {
            contentRef.current.style.transition = 'transform 0.25s ease-out'
            contentRef.current.style.transform = 'translateX(0px)'
        }
    }

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
            <main className="flex-grow p-4 md:p-8 pb-24 overflow-hidden overscroll-x-none" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
                <div ref={contentRef} key={location.pathname}>
                    <Outlet />
                </div>
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
