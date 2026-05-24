import { Link, useLocation } from 'react-router-dom'
import { Home, Calendar, BarChart2, Building2 } from 'lucide-react'
import { useClub } from '../lib/ClubContext'

interface BottomNavProps {
    onOpenSearch: () => void
}

function BottomNav({ onOpenSearch }: BottomNavProps) {
    const location = useLocation()
    const path = location.pathname
    const { favoriteClub, selectedClub } = useClub()
    const activeClub = selectedClub || favoriteClub

    const isActive = (route: string) => {
        if (route === '/' && path === '/') return true
        if (route !== '/' && path.startsWith(route)) return true
        return false
    }

    const clubHomePath = activeClub ? `/clube/${activeClub.slug}/home` : '#'
    const clubGamesPath = activeClub ? `/clube/${activeClub.slug}/games` : '#'

    const handleClubClick = (e: React.MouseEvent) => {
        if (!activeClub) {
            e.preventDefault()
            window.alert('Selecione um clube primeiro para aceder a esta página.')
            onOpenSearch()
        }
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-200 dark:border-white/10 pb-safe md:hidden">
            <div className="flex items-center justify-around h-16">
                <Link
                    to="/"
                    className={`flex flex-col items-center justify-center w-full h-full gap-1 ${isActive('/') ? 'text-dribly-purple' : 'text-zinc-400 dark:text-zinc-500'}`}
                >
                    <Building2 size={18} strokeWidth={isActive('/') ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">Início</span>
                </Link>

                <Link
                    to={clubHomePath}
                    onClick={handleClubClick}
                    className={`flex flex-col items-center justify-center w-full h-full gap-1 ${isActive(`/clube/${activeClub?.slug}/home`) ? 'text-dribly-purple' : 'text-zinc-400 dark:text-zinc-500'}`}
                >
                    <Home size={18} strokeWidth={isActive(`/clube/${activeClub?.slug}/home`) ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">Meu Clube</span>
                </Link>

                <Link
                    to={clubGamesPath}
                    onClick={handleClubClick}
                    className={`flex flex-col items-center justify-center w-full h-full gap-1 ${isActive(`/clube/${activeClub?.slug}/games`) ? 'text-dribly-purple' : 'text-zinc-400 dark:text-zinc-500'}`}
                >
                    <Calendar size={18} strokeWidth={isActive(`/clube/${activeClub?.slug}/games`) ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">Jogos</span>
                </Link>

                <Link
                    to="/standings"
                    className={`flex flex-col items-center justify-center w-full h-full gap-1 ${isActive('/standings') ? 'text-dribly-purple' : 'text-zinc-400 dark:text-zinc-500'}`}
                >
                    <BarChart2 size={18} strokeWidth={isActive('/standings') ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">Classificações</span>
                </Link>
            </div>
        </div>
    )
}

export default BottomNav
