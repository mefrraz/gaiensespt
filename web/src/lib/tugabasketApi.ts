import { Standing } from '../components/types'

const TUGABASKET_PROXY = '/api/tugabasket'

const CLUB_COMPETITIONS: Record<string, { id: number; displayName: string }[]> = {
    '2025/2026': [
        { id: 10904, displayName: 'Séniores' },
        { id: 11042, displayName: 'Sub 18' },
        { id: 11040, displayName: 'Sub 16' },
        { id: 11038, displayName: 'Sub 14' },
    ],
    '2024/2025': [
        { id: 10392, displayName: 'Séniores' },
        { id: 10478, displayName: 'Sub 18' },
        { id: 10476, displayName: 'Sub 16' },
        { id: 10487, displayName: 'Sub 14' },
    ],
}

export async function fetchFromProxy(path: string, params: Record<string, string | number>): Promise<string> {
    const searchParams = new URLSearchParams({ path })
    Object.entries(params).forEach(([k, v]) => searchParams.set(k, String(v)))
    const res = await fetch(`${TUGABASKET_PROXY}?${searchParams.toString()}`)
    if (!res.ok) throw new Error(`Tugabasket error: ${res.status}`)
    return res.text()
}

export async function fetchStandingsFromSource(season: string): Promise<Standing[]> {
    const comps = CLUB_COMPETITIONS[season]
    if (!comps || comps.length === 0) return []

    const results = await Promise.all(comps.map(async (comp) => {
        const html = await fetchFromProxy('/getCompetitionDetails', { competitionId: comp.id })
        const standings = parseAccordionStandings(html, comp.displayName)
        markFinishedGroups(standings, html)
        return standings
    }))

    return results.flat()
}

function parseAccordionStandings(html: string, displayName: string): Standing[] {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const standings: Standing[] = []

    const accordions = doc.querySelectorAll('.accordion')
    if (accordions.length === 0) {
        const table = doc.querySelector('table.standings')
        if (table) {
            const titleEl = doc.querySelector('.wrapper-title h4')
            const groupName = titleEl?.textContent?.trim() || ''
            parseTableRows(table, groupName, displayName, standings)
        }
        return standings
    }

    accordions.forEach(acc => {
        const titleEl = acc.querySelector('.accordion-title div')
        const groupName = titleEl?.textContent?.trim() || ''

        const table = acc.querySelector('table.standings, table.table-striped')
        if (!table) return

        parseTableRows(table, groupName, displayName, standings)
    })

    return standings
}

function parseTableRows(
    table: Element,
    groupName: string,
    displayName: string,
    standings: Standing[]
): void {
    const rows = table.querySelectorAll('tbody tr')
    rows.forEach(row => {
        const cols = row.querySelectorAll('td')
        if (cols.length < 5) return

        const posText = cols[0]?.querySelector('span')?.textContent?.trim() || cols[0]?.textContent?.trim() || '0'
        const teamName = cols[1]?.textContent?.trim() || ''

        standings.push({
            id: crypto.randomUUID(),
            competicao: displayName,
            grupo: groupName,
            equipa: teamName,
            posicao: parseInt(posText) || 0,
            jogos: parseInt(cols[2]?.textContent?.trim() || '0'),
            vitorias: parseInt(cols[3]?.textContent?.trim() || '0'),
            derrotas: parseInt(cols[4]?.textContent?.trim() || '0'),
            pontos: parseInt(cols[5]?.textContent?.trim() || '0'),
            is_finished: false,
        })
    })
}

function markFinishedGroups(standings: Standing[], html: string): void {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    const phaseHasPending: Record<string, boolean> = {}

    const tables = doc.querySelectorAll('table')
    for (const table of tables) {
        const rows = table.querySelectorAll('tbody tr')
        rows.forEach(row => {
            const cols = row.querySelectorAll('td')
            if (cols.length < 6) return

            const phaseText = cols[5]?.textContent?.trim() || ''
            const resultText = cols[3]?.textContent?.trim() || ''

            if (!phaseText) return

            if (!(phaseText in phaseHasPending)) {
                phaseHasPending[phaseText] = false
            }

            if (!resultText.includes(':')) {
                phaseHasPending[phaseText] = true
            }
        })
    }

    standings.forEach(s => {
        const exactMatch = phaseHasPending[s.grupo]
        if (exactMatch !== undefined) {
            s.is_finished = !exactMatch
            return
        }

        let matched = false
        for (const [gamePhase, pending] of Object.entries(phaseHasPending)) {
            if (s.grupo.includes(gamePhase) || gamePhase.includes(s.grupo)) {
                s.is_finished = !pending
                matched = true
                break
            }
        }

        if (!matched && Object.keys(phaseHasPending).length > 0) {
            const normalizedGroup = s.grupo.toLowerCase().replace(/[.\s]+/g, '')
            for (const [gamePhase, pending] of Object.entries(phaseHasPending)) {
                const normalizedPhase = gamePhase.toLowerCase().replace(/[.\s]+/g, '')
                if (normalizedGroup === normalizedPhase) {
                    s.is_finished = !pending
                    matched = true
                    break
                }
            }
        }
    })
}
