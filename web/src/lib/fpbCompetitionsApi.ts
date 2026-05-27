import { type Match } from '../components/types'

const FPB_PROXY = '/api/fpb'

export interface FPBStandingTeam {
    posicao: number
    equipa: string
    equipa_id?: string
    clube_id?: number
    j: number
    v: number
    d: number
    pm?: number
    ps?: number
    dif?: number
    pts: number
    logo?: string
}

export interface FPBGame {
    jogo_id?: string
    jornada?: number | string
    data: string
    hora?: string
    equipa_casa: string
    equipa_casa_id?: string
    equipa_fora: string
    equipa_fora_id?: string
    resultado_casa?: number
    resultado_fora?: number
    pavilhao?: string
    estado?: string
}

export interface FPBTeam {
    equipa_id?: string
    clube_id?: number
    nome: string
    abreviatura?: string
    logo?: string
    associacao?: string
}

export interface FPBPlayerStat {
    atleta_id: number
    nome: string
    clube_nome: string
    j: number
    pts: number
    reb?: number
    ast?: number
    blk?: number
    stl?: number
    val: number
    min?: number
}

const MONTHS_PT: Record<string, number> = {
  'JAN': 1, 'FEV': 2, 'MAR': 3, 'ABR': 4, 'MAI': 5, 'JUN': 6,
  'JUL': 7, 'AGO': 8, 'SET': 9, 'OUT': 10, 'NOV': 11, 'DEZ': 12,
}

function parseDatePt(dateStr: string): string | null {
  if (!dateStr) return null
  const cleaned = dateStr.replace(/,/g, '').trim().toUpperCase()
  const parts = cleaned.split(/\s+/)
  if (parts.length < 3) return null
  const day = parseInt(parts[0])
  if (isNaN(day)) return null
  const month = MONTHS_PT[parts[1]] || null
  if (!month) return null
  const year = parseInt(parts[2])
  if (isNaN(year)) return null
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function slugify(s: string): string {
  return s.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ---- API proxy helpers ----

async function fetchFromProxy(path: string): Promise<any> {
    const res = await fetch(`${FPB_PROXY}?endpoint=${encodeURIComponent(path)}`)
    if (!res.ok) throw new Error(`FPB API error: ${res.status}`)
    return res.json()
}

async function fetchHtml(page: string, competicao: number): Promise<string> {
    const params = new URLSearchParams()
    params.append('page', page)
    params.append('competicao', String(competicao))
    const res = await fetch(`${FPB_PROXY}?${params.toString()}`)
    if (!res.ok) throw new Error(`FPB error: ${res.status}`)
    return res.text()
}

// ---- Standings: API first, HTML fallback ----

export async function fetchStandings(provaId: number): Promise<FPBStandingTeam[]> {
    try {
        const data = await fetchFromProxy(`classificacao/${provaId}`)
        if (Array.isArray(data) && data.length > 0) return data
    } catch { /* fall through to HTML */ }

    const html = await fetchHtml('classificacao', provaId)
    return scrapeStandings(html)
}

function scrapeStandings(html: string): FPBStandingTeam[] {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const standings: FPBStandingTeam[] = []

    // Try .day-wrapper structure first
    const dayWrappers = doc.querySelectorAll('.day-wrapper')
    dayWrappers.forEach(dayWrapper => {
        const rows = dayWrapper.querySelectorAll('table tbody tr')
        rows.forEach(row => {
            const cols = row.querySelectorAll('td')
            if (cols.length < 5) return

            const pos = parseInt(cols[0]?.textContent?.trim() || '0') || 0
            const equipa = cols[1]?.textContent?.trim() || ''
            if (!equipa) return

            const team: FPBStandingTeam = {
                posicao: pos,
                equipa,
                j: parseInt(cols[2]?.textContent?.trim() || '0') || 0,
                v: parseInt(cols[3]?.textContent?.trim() || '0') || 0,
                d: parseInt(cols[4]?.textContent?.trim() || '0') || 0,
                pts: parseInt(cols[5]?.textContent?.trim() || '0') || 0,
            }
            if (cols.length > 6) team.pm = parseInt(cols[6]?.textContent?.trim() || '0') || undefined
            if (cols.length > 7) team.ps = parseInt(cols[7]?.textContent?.trim() || '0') || undefined
            if (cols.length > 8) team.dif = parseInt(cols[8]?.textContent?.trim() || '0') || undefined
            standings.push(team)
        })
    })

    // Fallback: generic table
    if (standings.length === 0) {
        const tables = doc.querySelectorAll('table')
        tables.forEach(table => {
            const rows = table.querySelectorAll('tbody tr')
            rows.forEach(row => {
                const cols = row.querySelectorAll('td')
                if (cols.length < 5) return

                const equipa = cols[0]?.textContent?.trim() || cols[1]?.textContent?.trim() || ''
                if (!equipa) return

                // Try to detect column order: [pos] [team] [j] [v] [d] [pts]
                const values = Array.from(cols).map(c => parseInt(c.textContent?.trim() || '0'))
                const nonNumeric = Array.from(cols).findIndex(c => isNaN(parseInt(c.textContent?.trim() || '')))
                const nameCol = nonNumeric >= 0 ? nonNumeric : 0

                const team: FPBStandingTeam = {
                    posicao: values[0] || 0,
                    equipa,
                    j: values[nameCol + 1] || 0,
                    v: values[nameCol + 2] || 0,
                    d: values[nameCol + 3] || 0,
                    pts: values[nameCol + 4] || 0,
                }
                if (values.length > nameCol + 5) team.pm = values[nameCol + 5] || undefined
                if (values.length > nameCol + 6) team.ps = values[nameCol + 6] || undefined
                standings.push(team)
            })
        })
    }

    return standings
}

// ---- Schedule & Results via HTML scraping ----

export async function fetchSchedule(provaId: number): Promise<FPBGame[]> {
    const html = await fetchHtml('calendario', provaId)
    return scrapeGames(html, 'AGENDADO')
}

export async function fetchResults(provaId: number): Promise<FPBGame[]> {
    const html = await fetchHtml('resultados', provaId)
    return scrapeGames(html, 'FINALIZADO')
}

function scrapeGames(html: string, defaultStatus: Match['status']): FPBGame[] {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const games: FPBGame[] = []

    // Try .day-wrapper (same as club pages)
    const dayWrappers = doc.querySelectorAll('.day-wrapper')
    dayWrappers.forEach(dayWrapper => {
        const dateEl = dayWrapper.querySelector('h3.date')
        const dateStr = dateEl?.textContent?.trim() || ''
        const isoDate = parseDatePt(dateStr)
        if (!isoDate) return

        const gameLinks = dayWrapper.querySelectorAll('a.game-wrapper-a')
        gameLinks.forEach((link: Element) => {
            const href = link.getAttribute('href') || ''
            const internalId = href.match(/internalID=(\d+)/)?.[1] || ''

            const teamContainers = link.querySelectorAll('.team-container')
            const homeName = (teamContainers[0]?.querySelector('.fullName') || teamContainers[0]?.querySelector('.sigla'))?.textContent?.trim() || ''
            const awayName = (teamContainers[1]?.querySelector('.fullName') || teamContainers[1]?.querySelector('.sigla'))?.textContent?.trim() || ''

            let resultado_casa: number | null = null
            let resultado_fora: number | null = null
            let status: FPBGame['estado'] = defaultStatus

            // Results
            const resultsWrapper = link.querySelector('.results_wrapper')
            if (resultsWrapper) {
                const scoreEls = resultsWrapper.querySelectorAll('h3.results_text')
                if (scoreEls.length >= 2) {
                    status = 'FINALIZADO'
                    resultado_casa = parseInt(scoreEls[0].textContent?.trim() || '0') || null
                    resultado_fora = parseInt(scoreEls[1].textContent?.trim() || '0') || null
                }
            }

            // Fallback: hour text might show score pattern
            const hourEl = link.querySelector('.hour h3')
            const hourText = hourEl?.textContent?.trim() || ''
            let hora = ''
            if (defaultStatus === 'AGENDADO' && hourText.includes('-') && !hourText.includes('H')) {
                const parts = hourText.split('-')
                if (parts.length === 2) {
                    const s1 = parseInt(parts[0].trim())
                    const s2 = parseInt(parts[1].trim())
                    if (!isNaN(s1) && !isNaN(s2)) {
                        status = 'FINALIZADO'
                        resultado_casa = s1
                        resultado_fora = s2
                    }
                }
            }
            if (defaultStatus === 'AGENDADO' && status === 'AGENDADO') {
                hora = (hourText || '').replace('H', ':').replace(/\s+/g, '')
            }

            // Competition name
            // (Not needed for competition pages — all games belong to same competition)

            // Location
            const locEl = link.querySelector('.location-wrapper b')
            const pavilhao = locEl?.textContent?.trim() || undefined

            const jogo_id = internalId || `${isoDate}-${slugify(homeName)}-${slugify(awayName)}`

            games.push({
                jogo_id,
                data: isoDate,
                hora: hora || undefined,
                equipa_casa: homeName.trim(),
                equipa_fora: awayName.trim(),
                resultado_casa: resultado_casa ?? undefined,
                resultado_fora: resultado_fora ?? undefined,
                pavilhao,
                estado: status,
            })
        })
    })

    // If no .day-wrapper found, try alternative: table rows
    if (games.length === 0) {
        const tables = doc.querySelectorAll('table')
        tables.forEach(table => {
            const rows = table.querySelectorAll('tbody tr')
            rows.forEach(row => {
                const cols = row.querySelectorAll('td')
                if (cols.length < 4) return

                const data = cols[0]?.textContent?.trim() || ''
                const hora = cols[1]?.textContent?.trim() || ''
                const equipa_casa = cols[2]?.textContent?.trim() || ''
                const resultado = cols[3]?.textContent?.trim() || ''
                const equipa_fora = cols[4]?.textContent?.trim() || ''

                if (!equipa_casa || !equipa_fora) return

                const isoDate = parseDatePt(data) || data

                let resultado_casa: number | undefined
                let resultado_fora: number | undefined
                let status: FPBGame['estado'] = defaultStatus

                if (resultado.includes('-') || resultado.includes('–')) {
                    const sep = resultado.includes('-') ? '-' : '–'
                    const parts = resultado.split(sep)
                    const s1 = parseInt(parts[0]?.trim())
                    const s2 = parseInt(parts[1]?.trim())
                    if (!isNaN(s1) && !isNaN(s2)) {
                        status = 'FINALIZADO'
                        resultado_casa = s1
                        resultado_fora = s2
                    }
                }

                games.push({
                    jogo_id: `${isoDate}-${slugify(equipa_casa)}-${slugify(equipa_fora)}`,
                    data: isoDate,
                    hora: hora || undefined,
                    equipa_casa,
                    equipa_fora,
                    resultado_casa,
                    resultado_fora,
                    estado: status,
                })
            })
        })
    }

    return games
}

// ---- Teams: API first, HTML fallback ----

export async function fetchTeams(provaId: number): Promise<FPBTeam[]> {
    try {
        const data = await fetchFromProxy(`equipas/prova/${provaId}`)
        if (Array.isArray(data) && data.length > 0) return data
    } catch { /* fall through to HTML */ }

    // Scrape from classificacao page which lists all teams
    const html = await fetchHtml('classificacao', provaId)
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const seen = new Set<string>()
    const teams: FPBTeam[] = []

    // Collect unique team names from standings tables
    const allRows = doc.querySelectorAll('table tbody tr')
    allRows.forEach(row => {
        const cols = row.querySelectorAll('td')
        if (cols.length < 5) return
        const name = cols[1]?.textContent?.trim() || ''
        if (name && !seen.has(name)) {
            seen.add(name)
            teams.push({ nome: name })
        }
    })

    // Also try .day-wrapper tables
    doc.querySelectorAll('.day-wrapper table tbody tr').forEach(row => {
        const cols = row.querySelectorAll('td')
        if (cols.length < 5) return
        const name = cols[1]?.textContent?.trim() || ''
        if (name && !seen.has(name)) {
            seen.add(name)
            teams.push({ nome: name })
        }
    })

    return teams
}

// ---- Player stats via API ----

export async function fetchPlayerStats(provaId: number, tipo: string = 'val'): Promise<FPBPlayerStat[]> {
    const data = await fetchFromProxy(`estatisticas/prova/${provaId}?tipo=${tipo}`)
    return data || []
}

export async function fetchMVP(provaId: number): Promise<FPBPlayerStat[]> {
    const data = await fetchFromProxy(`mvp/prova/${provaId}`)
    return data || []
}
