import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { fetchFPBGames } from '../lib/fpbApi'
import { Match } from '../components/types'

const CACHE_MINUTES = 5

function getTableName(season: string): string {
  return `games_${season.replace('/', '_')}`
}

function slugify(s: string): string {
  return s.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function useGames(season = '2025/2026', clube = 119) {
  const [games, setGames] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  const tableName = getTableName(season)

  const refresh = useCallback(async () => {
    try {
      const freshData = await fetchFPBGames(season, clube)
      const withEpoch = freshData.map(g => {
        const slug = `${g.data}-${slugify(g.equipa_casa)}-${slugify(g.equipa_fora)}`
        return {
          ...g,
          id: g.id || '',
          data: g.data,
          hora: g.hora || '',
          equipa_casa: g.equipa_casa || '',
          equipa_fora: g.equipa_fora || '',
          resultado_casa: g.resultado_casa,
          resultado_fora: g.resultado_fora,
          escalao: g.escalao || '',
          competicao: g.competicao || '',
          local: g.local || null,
          logotipo_casa: g.logotipo_casa || null,
          logotipo_fora: g.logotipo_fora || null,
          status: g.status,
          epoca: season,
          slug
        }
      })

      await supabase.from(tableName).upsert(
        withEpoch.map(g => ({ ...g, updated_at: new Date().toISOString() })),
        { onConflict: 'slug' }
      )

      setGames(withEpoch)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Failed to fetch games from FPB:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar jogos')
      throw err
    }
  }, [season, clube, tableName])

  useEffect(() => {
    let cancelled = false

    const loadData = async () => {
      setLoading(true)
      setError(null)

      try {
        const { data: cached } = await supabase
          .from(tableName)
          .select('*')
          .order('data', { ascending: true })

        if (!cancelled && cached && cached.length > 0) {
          setGames(cached as Match[])
          setLastUpdated(new Date(cached[0].updated_at || cached[0].created_at || Date.now()))
          setLoading(false)

          const updatedAt = new Date(cached[0].updated_at || cached[0].created_at || 0)
          const staleThreshold = new Date(Date.now() - CACHE_MINUTES * 60000)

          if (updatedAt < staleThreshold) {
            try {
              await refresh()
            } catch {
              // keep cached data on refresh failure
            }
          }
        } else {
          if (!cancelled) {
            try {
              await refresh()
            } catch {
              setError('Não foi possível carregar os jogos.')
            }
            setLoading(false)
          }
        }
      } catch (err) {
        console.error('Failed to load from Supabase:', err)
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, [season, clube, tableName, refresh])

  return {
    games,
    loading,
    lastUpdated,
    error,
    refresh
  }
}
