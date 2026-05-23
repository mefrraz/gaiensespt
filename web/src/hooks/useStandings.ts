import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { fetchStandingsFromSource, resolveDisplayName } from '../lib/tugabasketApi'
import { Standing } from '../components/types'

const CACHE_MINUTES = 15
const CLUB_SEARCH = 'GAIA'

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

async function clubCompetitions(season: string): Promise<{ id: number; displayName: string }[]> {
    const { data } = await supabase
        .from('competitions')
        .select('competition_id, competition_name, club_names')
        .eq('season', season)

    if (!data || data.length === 0) return []

    return data
        .filter(row => {
            const names = (row.club_names as string[]) || []
            return names.some(name => name.toUpperCase().includes(CLUB_SEARCH))
        })
        .map(row => ({
            id: row.competition_id as number,
            displayName: resolveDisplayName(row.competition_name as string),
        }))
}

export function useStandings(season = '2025/2026') {
    const localCache = loadLocalCache(season)
    const [standings, setStandings] = useState<Standing[]>(localCache)
    const [loading, setLoading] = useState(localCache.length === 0)
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
    const [error, setError] = useState<string | null>(null)
    const standingsRef = useRef<Standing[]>([])

    const tableName = getTableName(season)

    useEffect(() => {
        if (standings.length > 0) {
            saveLocalCache(season, standings)
        }
    }, [standings, season])

    const refresh = useCallback(async () => {
        try {
            const comps = await clubCompetitions(season)

            if (comps.length === 0) {
                setStandings([])
                setLastUpdated(new Date())
                return
            }

            const freshData = await fetchStandingsFromSource(comps)
            const withTimestamp = freshData.map(s => ({
                ...s,
                updated_at: new Date().toISOString(),
            }))

            const current = standingsRef.current
            if (current.length > 0 && withTimestamp.length > 0) {
                const currentKey = current
                    .map(g => `${g.competicao}|${g.grupo}|${g.equipa}|${g.posicao}|${g.pontos}`)
                    .sort().join(',')
                const freshKey = withTimestamp
                    .map(g => `${g.competicao}|${g.grupo}|${g.equipa}|${g.posicao}|${g.pontos}`)
                    .sort().join(',')
                if (currentKey === freshKey) {
                    return
                }
            }

            await supabase.from(tableName).upsert(withTimestamp, {
                onConflict: 'competicao,grupo,equipa',
            })

            setStandings(withTimestamp)
            setLastUpdated(new Date())
        } catch (err) {
            console.error('Failed to fetch standings:', err)
            setError(err instanceof Error ? err.message : 'Erro ao carregar classificações')
            throw err
        }
    }, [season, tableName])

    standingsRef.current = standings

    const lastUpdatedRef = useRef<Date | null>(null)
    lastUpdatedRef.current = lastUpdated

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                const last = lastUpdatedRef.current
                const staleThreshold = new Date(Date.now() - CACHE_MINUTES * 60000)
                if (!last || last < staleThreshold) {
                    refresh()
                }
            }
        }
        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
    }, [refresh])

    useEffect(() => {
        let cancelled = false

        const loadData = async () => {
            if (localCache.length === 0) {
                setLoading(true)
            }
            setError(null)

            try {
                const { data: cached } = await supabase
                    .from(tableName)
                    .select('*')
                    .order('competicao', { ascending: true })

                if (cached && cached.length > 0) {
                    const updatedAt = new Date(cached[0].updated_at || 0)
                    const staleThreshold = new Date(Date.now() - CACHE_MINUTES * 60000)
                    const isStale = updatedAt < staleThreshold

                    if (!isStale) {
                        if (!cancelled) {
                            setStandings(cached as Standing[])
                            setLastUpdated(updatedAt)
                            setLoading(false)
                        }
                    } else if (!cancelled) {
                        try {
                            await refresh()
                        } catch {
                            setStandings(cached as Standing[])
                            setLastUpdated(updatedAt)
                        }
                        setLoading(false)
                    }
                } else if (!cancelled) {
                    try {
                        await refresh()
                    } catch {
                        setError('Não foi possível carregar as classificações.')
                    }
                    setLoading(false)
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
