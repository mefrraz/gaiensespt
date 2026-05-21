import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { Match } from './types'

interface GameCardProps {
  match: Match
  mode: 'agenda' | 'results'
}

export function GameCard({ match, mode }: GameCardProps) {
  const slug = match.slug || `${match.data}-${match.equipa_casa.toLowerCase().replace(/\s+/g, '-')}-${match.equipa_fora.toLowerCase().replace(/\s+/g, '-')}`
  const isFinished = mode === 'results' && match.resultado_casa !== null && match.resultado_fora !== null
  const isGaiaWin = isFinished && (
    (match.equipa_casa.toUpperCase().includes('GAIA') && match.resultado_casa! > match.resultado_fora!) ||
    (match.equipa_fora.toUpperCase().includes('GAIA') && match.resultado_fora! > match.resultado_casa!)
  )

  return (
    <Link to={`/game/${slug}`} className="glass-card overflow-hidden group active:scale-[0.98] transition-all duration-200">
      {/* Top bar */}
      <div className="bg-gradient-to-r from-gaia-yellow/10 via-zinc-50 to-gaia-yellow/10 dark:from-gaia-yellow/5 dark:via-zinc-900 dark:to-gaia-yellow/5 border-b border-zinc-100 dark:border-white/5 p-3 flex justify-between items-center">
        <span className="text-[10px] font-bold text-gaia-yellow uppercase tracking-wide">{match.escalao}</span>
        <div className="flex items-center gap-2">
          {match.status === 'A DECORRER' && (
            <span className="text-red-500 text-[10px] font-bold flex items-center gap-1 animate-pulse">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              LIVE
            </span>
          )}
          <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 uppercase truncate">{match.competicao}</span>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        <div className="flex items-center justify-between gap-4">
          {/* Team 1 */}
          <div className="flex-1 flex flex-col items-center text-center gap-2 min-w-0">
            <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
              {match.logotipo_casa ? (
                <img src={match.logotipo_casa} alt="" className="w-14 h-14 object-contain" />
              ) : (
                <span className="text-2xl font-bold text-zinc-500">{match.equipa_casa.charAt(0)}</span>
              )}
            </div>
            <p className="text-sm font-bold text-zinc-900 dark:text-white leading-tight truncate w-full">
              {match.equipa_casa.toUpperCase()}
            </p>
          </div>

          {/* VS or Score */}
          {mode === 'agenda' ? (
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center ring-2 ring-gaia-yellow/20">
                <span className="text-sm font-black text-zinc-400 dark:text-zinc-500">VS</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 shrink-0">
              <span className="text-5xl font-bold font-mono tabular-nums leading-none">
                {match.resultado_casa ?? '-'}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wide">
                {isGaiaWin ? 'VITÓRIA' : match.resultado_fora !== null && match.resultado_casa !== null && match.resultado_fora > match.resultado_casa ? 'DERROTA' : 'FIN'}
              </span>
            </div>
          )}

          {/* Team 2 */}
          <div className="flex-1 flex flex-col items-center text-center gap-2 min-w-0">
            <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
              {match.logotipo_fora ? (
                <img src={match.logotipo_fora} alt="" className="w-14 h-14 object-contain" />
              ) : (
                <span className="text-2xl font-bold text-zinc-500">{match.equipa_fora.charAt(0)}</span>
              )}
            </div>
            <p className="text-sm font-bold text-zinc-900 dark:text-white leading-tight truncate w-full">
              {match.equipa_fora.toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      {/* FPB Link */}
      {match.id && (
        <div className="px-6 pb-5">
          <a
            href={`https://www.fpb.pt/ficha-de-jogo?internalID=${match.id}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 hover:text-gaia-yellow transition-colors"
          >
            <ExternalLink size={10} />
            Ver jogo na FPB
          </a>
        </div>
      )}
    </Link>
  )
}

