import { Link } from 'react-router-dom'
import { Trophy, BarChart2, TrendingUp, Building2, ArrowRight, ChevronRight } from 'lucide-react'
import { GameCarousel } from '../components/GameCarousel'
import { useClub } from '../lib/ClubContext'

function Landing() {
    const { favoriteClub } = useClub()

    return (
        <div className="pb-24">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-dribly-blue via-blue-600 to-dribly-blue-dark dark:from-dribly-blue-dark dark:via-blue-900 dark:to-dribly-black">
                <div className="max-w-5xl mx-auto px-4 pt-12 md:pt-16 pb-10 md:pb-14 text-center relative z-10">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-[11px] font-bold uppercase tracking-wider mb-5 border border-white/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        Época 2025/2026
                    </div>

                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-3 leading-tight">
                        Basquetebol<br />Português ao Vivo
                    </h1>
                    <p className="text-sm md:text-base text-white/70 max-w-md mx-auto leading-relaxed mb-6">
                        Usa a barra de pesquisa no topo para encontrares o teu clube.
                    </p>

                    {/* Favorite shortcut */}
                    {favoriteClub && (
                        <Link
                            to={`/clube/${favoriteClub.slug}/home`}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-xs font-bold border border-white/10 hover:bg-white/20 transition-all group"
                        >
                            <HomeIcon size={14} />
                            <span>Continuar com {favoriteClub.name}</span>
                            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    )}
                </div>
            </div>

            {/* Stats Bar */}
            <div className="bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-white/5">
                <div className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-around md:justify-center md:gap-20">
                    <span className="text-xs text-zinc-500"><strong className="text-zinc-900 dark:text-white">197</strong> Clubes</span>
                    <span className="text-xs text-zinc-500"><strong className="text-zinc-900 dark:text-white">411</strong> Competições</span>
                    <span className="text-xs text-zinc-500"><strong className="text-zinc-900 dark:text-white">24</strong> Associações</span>
                </div>
            </div>

            {/* Game Carousel */}
            <div className="py-8 bg-zinc-50/50 dark:bg-zinc-950/50">
                <div className="max-w-5xl mx-auto">
                    <GameCarousel />
                </div>
            </div>

            {/* Quick Links — all blue */}
            <div className="max-w-5xl mx-auto px-4 py-8">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-5">Explorar</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <QuickCard
                        to="/standings"
                        icon={<BarChart2 size={22} />}
                        title="Classificações"
                        desc="Tabelas de todas as associações"
                        gradient="from-dribly-blue to-dribly-blue-dim"
                    />
                    <QuickCard
                        to="/standings"
                        icon={<Trophy size={22} />}
                        title="Competições"
                        desc="400+ competições disponíveis"
                        gradient="from-dribly-blue-light to-dribly-blue"
                    />
                    <QuickCard
                        to="/about"
                        icon={<Building2 size={22} />}
                        title="Sobre"
                        desc="Como funciona o Dribly"
                        gradient="from-dribly-blue-dim to-dribly-blue-dark"
                    />
                    <QuickCard
                        to="/install"
                        icon={<TrendingUp size={22} />}
                        title="Instalar App"
                        desc="No ecrã do telemóvel"
                        gradient="from-dribly-blue to-blue-700"
                    />
                </div>
            </div>
        </div>
    )
}

function QuickCard({ to, icon, title, desc, gradient }: { to: string; icon: React.ReactNode; title: string; desc: string; gradient: string }) {
    return (
        <Link to={to} className="glass-card p-5 flex flex-col gap-4 group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-dribly-blue transition-colors flex items-center gap-1">
                    {title}
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </h3>
                <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">{desc}</p>
            </div>
        </Link>
    )
}

function HomeIcon({ size, className }: { size: number; className?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    )
}

export default Landing
