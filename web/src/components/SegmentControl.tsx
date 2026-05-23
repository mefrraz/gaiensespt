import { LucideIcon } from 'lucide-react'

interface Option {
  value: string
  label: string
  icon?: LucideIcon
}

interface SegmentControlProps {
  options: Option[]
  value: string
  onChange: (value: string) => void
}

export function SegmentControl({ options, value, onChange }: SegmentControlProps) {
  return (
    <div className="sticky top-16 z-40 bg-white/80 dark:bg-dribly-dark/80 backdrop-blur-xl p-1 rounded-2xl border border-zinc-200 dark:border-white/10 flex gap-1 shadow-lg max-w-sm mx-auto">
      {options.map(opt => {
        const active = value === opt.value
        const Icon = opt.icon
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              active
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            {Icon && <Icon size={14} strokeWidth={2.5} />}
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
