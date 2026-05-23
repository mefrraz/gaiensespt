import { Link, useLocation } from 'react-router-dom'
import { Home, Calendar, BarChart2, Search } from 'lucide-react'
import { useClub } from '../lib/ClubContext'

function BottomNav() {
    const location = useLocation()
    const path = location.pathname
    const { clubSlug } = useClub()
    const isClubPage = path.startsWith('/clube/')

    const isActive = (route: string) => {
        if (route === '/' && (path === '/' || path === '')) return true
        if (route !== '/' && path.startsWith(route)) return true
        return false
    }

    const navItems = isClubPage && clubSlug ? [
        { icon: Home, label: 'Início', path: `/clube/${clubSlug}` },
        { icon: Calendar, label: 'Jogos', path: `/clube/${clubSlug}/jogos` },
        { icon: BarChart2, label: 'Tabelas', path: '/standings' },
    ] : [
        { icon: Search, label: 'Clubes', path: '/' },
        { icon: BarChart2, label: 'Tabelas', path: '/standings' },
    ]

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-200 dark:border-white/10 pb-safe md:hidden">
            <div className={`flex items-center justify-around h-16`}>
                {navItems.map((item) => {
                    const active = isActive(item.path)
                    const Icon = item.icon
                    return (
                        <Link key={item.path} to={item.path}
                            className={`flex flex-col items-center justify-center w-full h-full gap-1 ${active ? 'text-amber-500' : 'text-zinc-400 dark:text-zinc-500'}`}>
                            <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
export default BottomNav
