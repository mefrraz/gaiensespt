import { useState, useEffect } from 'react'
import { fetchFromProxy } from '../lib/tugabasketApi'

interface CarouselGame {
    date: string
    home: string
    away: string
    score: string | null
    competition: string
    status: 'FINALIZADO' | 'AGENDADO' | 'AO VIVO'
}

const CAROUSEL_COMPS = [
    { id: 10902, label: 'Liga Betclic' },
    { id: 10903, label: 'Proliga' },
    { id: 10904, label: 'CN1' },
]

const CACHE_KEY = 'carousel_games'
const CACHE_TS = 'carousel_games_ts'
const CACHE_MIN = 30

function loadCache(): CarouselGame[] {
    try {
        const data = localStorage.getItem(CACHE_KEY)
        const ts = localStorage.getItem(CACHE_TS)
        if (data && ts && (Date.now() - parseInt(ts)) < CACHE_MIN * 60000) {
            return JSON.parse(data)
        }
    } catch {}
    return []
}

function saveCache(games: CarouselGame[]) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(games))
        localStorage.setItem(CACHE_TS, String(Date.now()))
    } catch {}
}

function parseGameTable(html: string, compLabel: string): CarouselGame[] {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const games: CarouselGame[] = []

    const tables = doc.querySelectorAll('table')
    for (const table of tables) {
        const rows = table.querySelectorAll('tbody tr')
        rows.forEach(row => {
            const cols = row.querySelectorAll('td')
            if (cols.length < 6) return

            const date = cols[1]?.textContent?.trim() || ''
            const home = cols[2]?.textContent?.trim() || ''
            const result = cols[3]?.textContent?.trim() || ''
            const away = cols[4]?.textContent?.trim() || ''

            if (!date || !home || !away) return

            let status: CarouselGame['status'] = 'AGENDADO'
            let score: string | null = null

            if (result && result.includes(':')) {
                status = 'FINALIZADO'
                score = result
            }

            games.push({ date, home, away, score, competition: compLabel, status })
        })
    }
    return games
}

export function useCarouselGames() {
    const cached = loadCache()
    const [games, setGames] = useState<CarouselGame[]>(cached)
    const [loading, setLoading] = useState(cached.length === 0)

    useEffect(() => {
        if (cached.length > 0) { setLoading(false); return }

        let cancelled = false
        async function load() {
            try {
                const results = await Promise.all(CAROUSEL_COMPS.map(async comp => {
                    const html = await fetchFromProxy('/getCompetitionDetails', { competitionId: comp.id })
                    return parseGameTable(html, comp.label)
                }))

                if (cancelled) return
                const all = results.flat().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                setGames(all)
                saveCache(all)
            } catch {} finally { if (!cancelled) setLoading(false) }
        }
        load()
        return () => { cancelled = true }
    }, [])

    return { games, loading }
}
