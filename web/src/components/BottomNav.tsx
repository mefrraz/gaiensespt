import { Link, useLocation } from 'react-router-dom'
import { Home, Calendar, Search } from 'lucide-react'
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
    ] : [
        { icon: Search, label: 'Clubes', path: '/' },
    ]

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#F9F9FF]/90 dark:bg-[#0D0D14]/90 backdrop-blur-xl border-t border-[#E4E2F5] dark:border-[#2A2A3D] pb-safe md:hidden">
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => {
                    const active = isActive(item.path)
                    const Icon = item.icon
                    return (
                        <Link key={item.path} to={item.path}
                            className={`flex flex-col items-center justify-center w-full h-full gap-1 ${active ? 'text-violet-600' : 'text-[#6B6880] dark:text-[#9B99B5]'}`}>
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
