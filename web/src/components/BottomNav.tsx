import { Link, useLocation } from 'react-router-dom'
import { Home, Calendar, Trophy, BarChart2 } from 'lucide-react'

function BottomNav() {
    const location = useLocation()
    const path = location.pathname

    const isActive = (route: string) => {
        if (route === '/' && path === '/') return true
        if (route !== '/' && path.startsWith(route)) return true
        return false
    }

    const navItems = [
        { icon: Home, label: 'Início', path: '/' },
        { icon: Calendar, label: 'Agenda', path: '/agenda' },
        { icon: Trophy, label: 'Resultados', path: '/results' },
        { icon: BarChart2, label: 'Tabelas', path: '/standings' },
    ]

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-200 dark:border-white/10 pb-safe md:hidden">
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => {
                    const active = isActive(item.path)
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center justify-center w-full h-full gap-1 ${active ? 'text-gaia-yellow' : 'text-zinc-400 dark:text-zinc-500'
                                }`}
                        >
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
