import { Standing } from './types'

interface Props {
    grupo: string
    teams: Standing[]
    isOpen: boolean
    onToggle: () => void
    status: 'active' | 'finished'
}

export function StandingsTable({ grupo, teams, isOpen, onToggle, status }: Props) {
    const sorted = [...teams].sort((a, b) => a.posicao - b.posicao)

    return (
        <div className="bg-white dark:bg-zinc-900/60 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors group"
            >
                <div className="flex items-center gap-3 min-w-0">
                    {status === 'active' ? (
                        <span className="shrink-0 w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse" />
                    ) : (
                        <span className="shrink-0 w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                    )}
                    <div className="text-left min-w-0">
                        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors truncate">
                            {grupo}
                        </h3>
                        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                            {teams.length} equipas
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                    {status === 'active' ? (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-wide">
                            A Decorrer
                        </span>
                    ) : (
                        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full uppercase tracking-wide">
                            Terminada
                        </span>
                    )}
                    <svg
                        className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            <div
                className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
            >
                <div className="overflow-hidden">
                    <div className="px-2.5 pb-3">
                        <div className="overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-800/40">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-zinc-50 dark:bg-zinc-800/40">
                                        <th className="sticky left-0 bg-zinc-50 dark:bg-zinc-800/40 pl-3 pr-1.5 py-2.5 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-wider w-[42px]">#</th>
                                        <th className="sticky left-[42px] bg-zinc-50 dark:bg-zinc-800/40 pl-1.5 pr-3 py-2.5 text-left text-[10px] font-bold text-zinc-400 uppercase tracking-wider min-w-[130px]">Equipa</th>
                                        <th className="px-2 py-2.5 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-wider w-[44px]">Pts</th>
                                        <th className="px-2 py-2.5 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-wider w-[36px]">J</th>
                                        <th className="px-2 py-2.5 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-wider w-[36px]">V</th>
                                        <th className="pr-3 pl-2 py-2.5 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-wider w-[36px]">D</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/30">
                                    {sorted.map((team, i) => (
                                        <tr
                                            key={team.id || i}
                                            className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/20 transition-colors"
                                        >
                                            <td className="sticky left-0 bg-white dark:bg-zinc-900/60 pl-3 pr-1.5 py-2.5 text-center">
                                                <span className="text-xs font-semibold text-zinc-400 tabular-nums">
                                                    {team.posicao}
                                                </span>
                                            </td>
                                            <td className="sticky left-[42px] bg-white dark:bg-zinc-900/60 pl-1.5 pr-3 py-2.5">
                                                <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate block max-w-[140px] sm:max-w-[220px]">
                                                    {team.equipa}
                                                </span>
                                            </td>
                                            <td className="px-2 py-2.5 text-center">
                                                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 tabular-nums">
                                                    {team.pontos}
                                                </span>
                                            </td>
                                            <td className="px-2 py-2.5 text-center">
                                                <span className="text-xs text-zinc-500 tabular-nums">{team.jogos}</span>
                                            </td>
                                            <td className="px-2 py-2.5 text-center">
                                                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">{team.vitorias}</span>
                                            </td>
                                            <td className="pr-3 pl-2 py-2.5 text-center">
                                                <span className="text-xs font-medium text-red-500 tabular-nums">{team.derrotas}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
