export function SkeletonCard() {
  return (
    <div className="glass-card animate-pulse">
      <div className="flex justify-between items-center p-4 pb-2 border-b border-zinc-100 dark:border-white/5">
        <div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-700 rounded" />
        <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-700 rounded" />
      </div>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
            <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-700 rounded" />
          </div>
          <div className="h-6 w-8 bg-zinc-200 dark:bg-zinc-700 rounded" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
            <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-700 rounded" />
          </div>
          <div className="h-6 w-8 bg-zinc-200 dark:bg-zinc-700 rounded" />
        </div>
      </div>
      <div className="px-4 pb-4">
        <div className="h-3 w-32 bg-zinc-200 dark:bg-zinc-700 rounded" />
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-2 md:px-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
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
