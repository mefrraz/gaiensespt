import { useState, useEffect, useRef } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { Sun, Moon, Instagram, Github, Info, Calendar, BarChart2, Download } from 'lucide-react'
import PWAInstallBanner from './components/PWAInstallBanner'
import BottomNav from './components/BottomNav'
import Dashboard from './pages/Dashboard'
import Games from './pages/Games'
import Standings from './pages/Standings'
import { useGames } from './hooks/useGames'
import { GameDataContext } from './lib/GameDataContext'

const SWIPE_PAGES = ['/', '/games', '/standings']

function Layout() {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')
    const location = useLocation()
    const navigate = useNavigate()
    const touchStartX = useRef(0)
    const touchStartY = useRef(0)
    const dragOffsetRef = useRef(0)
    const isSwiping = useRef(false)
    const isDragging = useRef(false)
    const carouselRef = useRef<HTMLDivElement>(null)

    const isSwipePage = SWIPE_PAGES.includes(location.pathname)
    const currentIndex = SWIPE_PAGES.indexOf(location.pathname)

    const [carouselTarget, setCarouselTarget] = useState<number | null>(null)

    const { games, loading, lastUpdated, error, refresh } = useGames('2025/2026', 119)

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

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX
        touchStartY.current = e.touches[0].clientY
        isSwiping.current = false
        isDragging.current = false
        dragOffsetRef.current = 0
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isSwipePage || !carouselRef.current) return
        const deltaX = e.touches[0].clientX - touchStartX.current
        const deltaY = e.touches[0].clientY - touchStartY.current

        if (!isSwiping.current) {
            if (Math.abs(deltaY) > Math.abs(deltaX) || Math.abs(deltaX) < 10) return
            isSwiping.current = true
        }

        isDragging.current = true
        const idx = carouselTarget ?? currentIndex

        if (deltaX > 0 && idx <= 0) {
            dragOffsetRef.current = deltaX * 0.2
        } else if (deltaX < 0 && idx >= SWIPE_PAGES.length - 1) {
            dragOffsetRef.current = deltaX * 0.2
        } else {
            dragOffsetRef.current = deltaX
        }

        carouselRef.current.style.transform = `translateX(${-(idx * 100) + (dragOffsetRef.current / window.innerWidth * 100)}%)`
        carouselRef.current.style.transition = 'none'
    }

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!isSwipePage || !carouselRef.current) return
        const deltaX = e.changedTouches[0].clientX - touchStartX.current
        const idx = carouselTarget ?? currentIndex
        isDragging.current = false
        dragOffsetRef.current = 0

        if (Math.abs(deltaX) > 50) {
            const dir = deltaX > 0 ? -1 : 1
            const target = idx + dir
            if (target >= 0 && target < SWIPE_PAGES.length) {
                setCarouselTarget(target)
                carouselRef.current.style.transition = 'transform 0.2s ease-out'
                carouselRef.current.style.transform = `translateX(${-(target * 100)}%)`
                setTimeout(() => {
                    setCarouselTarget(null)
                    navigate(SWIPE_PAGES[target])
                }, 200)
            } else {
                carouselRef.current.style.transition = 'transform 0.25s ease-out'
                carouselRef.current.style.transform = `translateX(${-(idx * 100)}%)`
            }
        } else {
            carouselRef.current.style.transition = 'transform 0.25s ease-out'
            carouselRef.current.style.transform = `translateX(${-(idx * 100)}%)`
        }
    }

    const displayIndex = carouselTarget ?? currentIndex

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
            <main className="flex-grow min-h-0 p-4 md:p-8 pb-24 overflow-hidden overscroll-x-none" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
                {isSwipePage ? (
                    <div className="relative w-full h-full overflow-hidden">
                        <div
                            ref={carouselRef}
                            style={{
                                display: 'flex',
                                height: '100%',
                                transform: `translateX(${-(displayIndex * 100)}%)`,
                                transition: 'transform 0.25s ease-out',
                            }}
                        >
                            <GameDataContext.Provider value={{ games, loading, lastUpdated, error, refresh }}>
                                <div key="/" className="w-full shrink-0 h-full overflow-y-auto">
                                    <Dashboard />
                                </div>
                                <div key="/games" className="w-full shrink-0 h-full overflow-y-auto">
                                    <Games />
                                </div>
                                <div key="/standings" className="w-full shrink-0 h-full overflow-y-auto">
                                    <Standings />
                                </div>
                            </GameDataContext.Provider>
                        </div>
                    </div>
                ) : (
                    <Outlet />
                )}
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
