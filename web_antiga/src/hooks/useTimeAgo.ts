import { useState, useEffect } from 'react'

export function useTimeAgo(date: Date | null): string {
  const [timeAgo, setTimeAgo] = useState('')

  useEffect(() => {
    const update = () => {
      if (!date) {
        setTimeAgo('')
        return
      }
      const diffMs = Date.now() - date.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      if (diffMins < 1) setTimeAgo('agora mesmo')
      else if (diffMins < 60) setTimeAgo(`há ${diffMins}min`)
      else if (diffMins < 1440) setTimeAgo(`há ${Math.floor(diffMins / 60)}h`)
      else setTimeAgo(`há ${Math.floor(diffMins / 1440)}d`)
    }
    update()
    const interval = setInterval(update, 30000)
    return () => clearInterval(interval)
  }, [date])

  return timeAgo
}
