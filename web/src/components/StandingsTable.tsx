import { Standing } from './types'
import { ChevronDown } from 'lucide-react'

interface Props {
    grupo: string
    teams: Standing[]
    isOpen: boolean
    onToggle: () => void
    status: 'active' | 'finished'
}

export function StandingsTable({ grupo, teams, isOpen, onToggle, status }: Props) {
    const sorted = [...teams].sort((a, b) => a.posicao - b.posicao)
    const isGaia = (name: string) => name.toUpperCase().includes('GAIA')

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            {/* Header */}
            <button onClick={onToggle} className="w-full px-4 py-3 flex items-center justify-between bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                <div className="flex items-center gap-3">
                    <div className="text-left">
                        <span className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors mr-2">
                            {grupo}
                        </span>
                        {status === 'active' ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 uppercase tracking-wide">
                                A Decorrer
                            </span>
                        ) : (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 uppercase tracking-wide">
                                Terminada
                            </span>
                        )}
                    </div>
                </div>
                <div className={`w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center transition-transform duration-200 ${isOpen ? 'rotate-180 bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-500' : 'text-zinc-400'}`}>
                    <ChevronDown size={14} />
                </div>
            </button>

            {/* Content with animation */}
            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    {/* Desktop Header */}
                    <div className="hidden md:grid grid-cols-[40px_1fr_50px_40px_40px_40px] px-4 py-2 bg-zinc-50 dark:bg-zinc-950/50 border-y border-zinc-100 dark:border-zinc-800 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        <span className="text-center">#</span>
                        <span>Equipa</span>
                        <span className="text-center">Pts</span>
                        <span className="text-center">J</span>
                        <span className="text-center">V</span>
                        <span className="text-center">D</span>
                    </div>

                    {/* Mobile Header */}
                    <div className="md:hidden grid grid-cols-[28px_1fr_36px_28px_28px_28px] px-3 py-2 bg-zinc-50 dark:bg-zinc-950/50 border-y border-zinc-100 dark:border-zinc-800 text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                        <span className="text-center">#</span>
                        <span>Equipa</span>
                        <span className="text-center">Pts</span>
                        <span className="text-center">J</span>
                        <span className="text-center">V</span>
                        <span className="text-center">D</span>
                    </div>

                    {/* Rows */}
                    {sorted.map(team => {
                        const gaia = isGaia(team.equipa)
                        const top = team.posicao <= 2
                        const bottom = team.posicao >= sorted.length - 1

                        return (
                            <div key={team.id} className={`border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors ${gaia ? 'bg-amber-50/60 dark:bg-amber-500/10' : ''}`}>
                                {/* Desktop Row */}
                                <div className="hidden md:grid grid-cols-[40px_1fr_50px_40px_40px_40px] px-4 py-3 items-center">
                                    <span className={`text-center text-sm font-bold ${top ? 'text-green-600' : bottom ? 'text-red-500' : 'text-zinc-400'}`}>{team.posicao}</span>
                                    <div>
                                        <span className={`block text-xs truncate ${gaia ? 'font-bold text-amber-900 dark:text-amber-400' : 'font-semibold text-zinc-900 dark:text-white'}`}>{team.equipa}</span>
                                    </div>
                                    <span className={`text-center text-sm font-black ${gaia ? 'text-amber-600' : 'text-zinc-900 dark:text-white'}`}>{team.pontos}</span>
                                    <span className="text-center text-xs font-medium text-zinc-500">{team.jogos}</span>
                                    <span className="text-center text-xs font-bold text-green-600">{team.vitorias}</span>
                                    <span className="text-center text-xs font-medium text-red-500">{team.derrotas}</span>
                                </div>

                                {/* Mobile Row */}
                                <div className="md:hidden grid grid-cols-[28px_1fr_36px_28px_28px_28px] px-3 py-2.5 items-center">
                                    <span className={`text-center text-xs font-bold ${top ? 'text-green-600' : bottom ? 'text-red-500' : 'text-zinc-400'}`}>{team.posicao}</span>
                                    <div className="min-w-0">
                                        <span className={`text-[11px] truncate ${gaia ? 'font-bold text-amber-900 dark:text-amber-400' : 'font-medium text-zinc-900 dark:text-white'}`}>{team.equipa}</span>
                                    </div>
                                    <span className={`text-center text-sm font-black ${gaia ? 'text-amber-600' : 'text-zinc-900 dark:text-white'}`}>{team.pontos}</span>
                                    <span className="text-center text-[10px] text-zinc-500">{team.jogos}</span>
                                    <span className="text-center text-[10px] font-bold text-green-600">{team.vitorias}</span>
                                    <span className="text-center text-[10px] font-medium text-red-500">{team.derrotas}</span>
                                </div>
                            </div>
                        )
                    })}
                    {/* Empty State / Footer of table */}
                    <div className="bg-zinc-50 dark:bg-zinc-950/50 h-1 border-t border-zinc-100 dark:border-zinc-800" />
                </div>
            </div>
        </div>
    )
}
