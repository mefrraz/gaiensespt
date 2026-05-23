import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { fetchStandingsFromSource } from '../lib/tugabasketApi'
import { Standing } from '../components/types'

const CACHE_MINUTES = 15

const LS_KEY = (season: string) => `standings_cache_${season}`
const LS_TS = (season: string) => `standings_cache_ts_${season}`

function loadLocalCache(season: string): Standing[] {
    try {
        const stored = localStorage.getItem(LS_KEY(season))
        const storedTs = localStorage.getItem(LS_TS(season))
        if (stored && storedTs) {
            const parsed = JSON.parse(stored) as Standing[]
            const age = Date.now() - parseInt(storedTs)
            if (parsed.length > 0 && age < CACHE_MINUTES * 60000) {
                return parsed
            }
        }
    } catch { /* localStorage unavailable */ }
    return []
}

function saveLocalCache(season: string, standings: Standing[]) {
    try {
        localStorage.setItem(LS_KEY(season), JSON.stringify(standings))
        localStorage.setItem(LS_TS(season), Date.now().toString())
    } catch { /* localStorage full or unavailable */ }
}

function getTableName(season: string): string {
    return `classificacoes_${season.replace('/', '_')}`
}

export function useStandings(season = '2025/2026', competitionIds?: number[]) {
    const localCache = loadLocalCache(season)
    const [standings, setStandings] = useState<Standing[]>(competitionIds ? [] : localCache)
    const [loading, setLoading] = useState(false)
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
    const [error, setError] = useState<string | null>(null)

    const tableName = getTableName(season)

    useEffect(() => {
        if (standings.length > 0 && !competitionIds) {
            saveLocalCache(season, standings)
        }
    }, [standings, season, competitionIds])

    const refresh = useCallback(async () => {
        if (!competitionIds || competitionIds.length === 0) return

        setLoading(true)
        setError(null)

        try {
            const comps = competitionIds.map(id => ({ id, displayName: '' }))
            const freshData = await fetchStandingsFromSource(comps)
            const withTimestamp = freshData.map(s => ({
                ...s,
                updated_at: new Date().toISOString(),
            }))

            await supabase.from(tableName).upsert(withTimestamp, {
                onConflict: 'competicao,grupo,equipa',
            })

            setStandings(withTimestamp)
            setLastUpdated(new Date())
        } catch (err) {
            console.error('Failed to fetch standings:', err)
            setError(err instanceof Error ? err.message : 'Erro ao carregar classificações')
        } finally {
            setLoading(false)
        }
    }, [season, tableName, competitionIds])

    useEffect(() => {
        if (!competitionIds || competitionIds.length === 0) {
            setStandings([])
            setLoading(false)
            return
        }

        let cancelled = false

        const loadData = async () => {
            setLoading(true)
            setError(null)

            try {
                const { data: cached } = await supabase
                    .from(tableName)
                    .select('*')
                    .in('competicao', competitionIds.map(String))
                    .order('competicao', { ascending: true })

                if (cached && cached.length > 0) {
                    const updatedAt = new Date(cached[0].updated_at || 0)
                    const staleThreshold = new Date(Date.now() - CACHE_MINUTES * 60000)

                    if (updatedAt > staleThreshold) {
                        if (!cancelled) {
                            setStandings(cached as Standing[])
                            setLastUpdated(updatedAt)
                            setLoading(false)
                        }
                    } else {
                        if (!cancelled) await refresh()
                        else setLoading(false)
                    }
                } else if (!cancelled) {
                    await refresh()
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
        return () => { cancelled = true }
    }, [season, tableName, refresh])

    return {
        standings,
        loading,
        lastUpdated,
        error,
        refresh,
    }
}
