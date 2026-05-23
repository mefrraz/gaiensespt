import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Sun, Moon, Home, Calendar } from 'lucide-react'
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

    const navLink = 'hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-xs font-bold'
    const navActive = 'bg-[#16161F] dark:bg-white/10 text-white dark:text-white shadow-sm'
    const navInactive = 'text-[#6B6880] dark:text-[#9B99B5] hover:text-[#0D0D14] dark:hover:text-white hover:bg-[#E4E2F5] dark:hover:bg-white/5'

    function isActive(path: string) {
        if (path === '/') return location.pathname === '/'
        return location.pathname.startsWith(path)
    }

    return (
        <div className="min-h-screen bg-[#F9F9FF] dark:bg-[#0D0D14] text-[#0D0D14] dark:text-[#F1F0FF] transition-colors duration-300 flex flex-col font-sans">
            <nav className="sticky top-0 z-50 bg-[#F9F9FF]/80 dark:bg-[#0D0D14]/80 backdrop-blur-md border-b border-[#E4E2F5] dark:border-[#2A2A3D]">
                <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2.5 group shrink-0">
                        <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm shadow-violet-600/20">
                            <span className="text-white font-black text-xs">D</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-sm leading-tight tracking-tight">Dribly</span>
                            {isClubPage && clubName && (
                                <span className="text-[9px] uppercase tracking-widest text-violet-600 font-bold truncate max-w-[100px]">{clubName}</span>
                            )}
                        </div>
                    </Link>

                    <div className="flex items-center gap-1">
                        {isClubPage && (
                            <>
                                <Link to={`/clube/${clubSlug}`} className={`${navLink} ${isActive(`/clube/${clubSlug}`) && !location.pathname.includes('/jogos') ? navActive : navInactive}`}>
                                    <Home size={14} /><span>Início</span>
                                </Link>
                                <Link to={`/clube/${clubSlug}/jogos`} className={`${navLink} ${isActive(`/clube/${clubSlug}/jogos`) ? navActive : navInactive}`}>
                                    <Calendar size={14} /><span>Jogos</span>
                                </Link>
                            </>
                        )}
                        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="p-2 rounded-full hover:bg-[#E4E2F5] dark:hover:bg-white/5 text-[#6B6880] dark:text-[#9B99B5] transition-colors">
                            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                        </button>
                    </div>
                </div>
            </nav>

            <main className="flex-grow p-3 sm:p-4 md:p-6 pb-24"><Outlet /></main>

            <BottomNav />
            <PWAInstallBanner />
        </div>
    )
}
export default Layout
