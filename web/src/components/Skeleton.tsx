export function SkeletonBar() {
  return (
    <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-900 overflow-hidden rounded-full">
      <div className="h-full bg-gradient-to-r from-gaia-yellow/40 via-gaia-yellow to-gaia-yellow/40 animate-pulseSoft rounded-full" />
    </div>
  )
}

export function SkeletonHero() {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-lg border border-zinc-100 dark:border-white/5 animate-pulse">
      <div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-700 rounded mb-4" />
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
          <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-700 rounded" />
        </div>
        <div className="h-8 w-12 bg-zinc-200 dark:bg-zinc-700 rounded" />
        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
          <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-700 rounded" />
        </div>
      </div>
      <div className="flex justify-center">
        <div className="h-3 w-40 bg-zinc-200 dark:bg-zinc-700 rounded" />
      </div>
    </div>
  )
}
