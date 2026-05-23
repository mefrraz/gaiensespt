import { Calendar, Trophy, AlertCircle, type LucideIcon } from 'lucide-react'

const icons: Record<string, LucideIcon> = {
  agenda: Calendar,
  results: Trophy,
  error: AlertCircle,
}

interface EmptyStateProps {
  view?: 'agenda' | 'results'
  icon?: string
  title?: string
  subtitle?: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ view, icon, title, subtitle, action }: EmptyStateProps) {
  const Icon = icon ? icons[icon] : view ? icons[view] : Trophy

  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
        <Icon size={28} className="text-zinc-400 dark:text-zinc-500" strokeWidth={1.5} />
      </div>
      <h3 className="text-sm font-bold text-zinc-600 dark:text-zinc-400 mb-1">
        {title || (view === 'agenda' ? 'Nenhum jogo agendado' : 'Nenhum resultado encontrado')}
      </h3>
      {subtitle && (
        <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-[220px]">
          {subtitle}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 text-xs font-bold bg-dribly-blue text-white rounded-lg hover:bg-dribly-blue-dim transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
