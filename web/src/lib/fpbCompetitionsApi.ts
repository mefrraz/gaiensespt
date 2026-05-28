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

export interface FPBStandingPhase {
    name: string
    teams: FPBStandingTeam[]
}

export async function fetchStandings(provaId: number): Promise<FPBStandingPhase[]> {
    // Step 1: Fetch HTML and extract ALL fase IDs
    const faseIds: { id: string; name: string }[] = []
    try {
        const html = await fetchHtml('classificacao', provaId)
        const re = /<li[^>]*class="[^"]*option[^"]*"[^>]*tag="([^"]*)"[^>]*value="([^"]+)"/g
        let m: RegExpExecArray | null
        while ((m = re.exec(html)) !== null) {
            const name = m[1].trim()
            const id = m[2]
            if (!faseIds.find(f => f.id === id)) {
                faseIds.push({ id, name })
            }
        }
    } catch { /* use fallback */ }

    if (faseIds.length === 0) {
        faseIds.push({ id: '30969', name: 'Fase Regular' })
    }

    // Step 2: Fetch all phases in parallel
    const results = await Promise.all(faseIds.map(async (fase) => {
        const params = new URLSearchParams({
            wp_action: 'get_more_fase_regular',
            competicao: String(provaId),
            fase: fase.id,
        })
        try {
            const res = await fetch(`${FPB_PROXY}?${params.toString()}`)
            if (!res.ok) return { name: fase.name, teams: [] as FPBStandingTeam[] }
            const json = await res.json()
            const body: string = json?.result?.body || ''
            if (!body) return { name: fase.name, teams: [] as FPBStandingTeam[] }
            return { name: fase.name, teams: scrapeStandings(body) }
        } catch {
            return { name: fase.name, teams: [] as FPBStandingTeam[] }
        }
    }))

    return results // keep all phases, even empty ones (playoffs/finals)
}

function scrapeStandings(html: string): FPBStandingTeam[] {
    // WordPress AJAX response has team-row divs with h5 elements
    const standings: FPBStandingTeam[] = []

    // Split by team-row — each is one team
    const rows = html.split(/<div[^>]*class="[^"]*team-row[^"]*"[^>]*>/)
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i]

        // Extract team name: first <h5> without <b>/<strong> (skip position h5)
        const nameMatch = row.match(/<h5[^>]*>([^<]+)<\/h5>/)
        if (!nameMatch) continue
        const nome = nameMatch[1].trim()
        if (!nome || nome.length < 3) continue

        // Collect all h5 values (with optional attributes, <b>/<strong>)
        const h5s: string[] = []
        const h5Regex = /<h5[^>]*>(?:\s*<(?:b|strong)>)?([^<]*?)(?:<\/(?:b|strong)>)?\s*<\/h5>/g
        let m: RegExpExecArray | null
        while ((m = h5Regex.exec(row)) !== null) {
            h5s.push(m[1].trim())
        }

        if (h5s.length < 4) continue

        // Position is first h5 (inside <b>), name is second, abbreviation is third
        // Stats follow: J, V, D, FC, PM, PS, DIF, PTS
        const stats = h5s.slice(3) // skip pos, name, abrev

        standings.push({
            posicao: standings.length + 1,
            equipa: nome,
            j: num(stats[0]),
            v: num(stats[1]),
            d: num(stats[2]),
            pm: num(stats[4]),
            ps: num(stats[5]),
            dif: signedNum(stats[6]),
            pts: num(stats[7]),
        })
    }

    return standings
}

function num(s: string | undefined): number {
    return parseInt(s || '0') || 0
}

function signedNum(s: string | undefined): number | undefined {
    if (!s) return undefined
    const v = parseInt(s)
    return isNaN(v) ? undefined : v
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

// ---- Player stats: API first, HTML fallback ----

export async function fetchPlayerStats(provaId: number, tipo: string = 'val'): Promise<FPBPlayerStat[]> {
    try {
        const data = await fetchFromProxy(`estatisticas/prova/${provaId}?tipo=${tipo}`)
        if (Array.isArray(data) && data.length > 0) return data
    } catch { /* fall through to HTML */ }

    const html = await fetchHtml('estatistica', provaId)
    return scrapePlayerStats(html)
}

function scrapePlayerStats(html: string): FPBPlayerStat[] {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const allStats: Map<number, FPBPlayerStat> = new Map()

    // Try .day-wrapper tables first
    const dayWrappers = doc.querySelectorAll('.day-wrapper')
    dayWrappers.forEach(dayWrapper => {
        const rows = dayWrapper.querySelectorAll('table tbody tr')
        rows.forEach(row => {
            const cols = row.querySelectorAll('td')
            if (cols.length < 4) return
            const nome = cols[0]?.textContent?.trim() || cols[1]?.textContent?.trim() || ''
            if (!nome) return
            const atleta_id = Math.abs(hashCode(nome))
            allStats.set(atleta_id, parseStatRow(cols, nome, atleta_id))
        })
    })

    // Fallback: generic tables
    if (allStats.size === 0) {
        doc.querySelectorAll('table tbody tr').forEach(row => {
            const cols = row.querySelectorAll('td')
            if (cols.length < 4) return
            const nome = cols[0]?.textContent?.trim() || cols[1]?.textContent?.trim() || ''
            if (!nome) return
            const atleta_id = Math.abs(hashCode(nome))
            if (!allStats.has(atleta_id)) {
                allStats.set(atleta_id, parseStatRow(cols, nome, atleta_id))
            }
        })
    }

    return Array.from(allStats.values())
}

function parseStatRow(cols: NodeListOf<Element>, nome: string, atleta_id: number): FPBPlayerStat {
    const get = (i: number) => parseFloat(cols[i]?.textContent?.trim() || '0') || 0
    return {
        atleta_id,
        nome,
        clube_nome: '',
        j: get(1),
        pts: get(2),
        reb: get(3),
        ast: get(4),
        blk: get(5),
        stl: get(6),
        val: get(cols.length - 1),
    }
}

function hashCode(s: string): number {
    let h = 0
    for (let i = 0; i < s.length; i++) {
        h = ((h << 5) - h) + s.charCodeAt(i)
        h |= 0
    }
    return h
}

export async function fetchMVP(provaId: number): Promise<FPBPlayerStat[]> {
    const data = await fetchFromProxy(`mvp/prova/${provaId}`)
    return data || []
}

// ---- Game Detail via HTML scraping ----

export interface FPBGameDetail {
    internalID: string
    data: string
    fase: string
    equipa_casa: string
    equipa_fora: string
    resultado_casa: number
    resultado_fora: number
    parciais: { periodo: string; casa: number; fora: number }[]
    pavilhao: string
    espetadores: number
    gameLeaders: { categoria: string; casa: { nome: string; valor: string }; fora: { nome: string; valor: string } }[]
    boxScoreCasa: FPBBoxScorePlayer[]
    boxScoreFora: FPBBoxScorePlayer[]
    teamStats: { label: string; casa: string; fora: string }[]
}

export interface FPBBoxScorePlayer {
    numero: number
    nome: string
    min: string
    pts: number
    l2: string
    l2pct: string
    l3: string
    l3pct: string
    ll: string
    llpct: string
    ro: number
    rd: number
    rt: number
    as: number
    rb: number
    to: number
    dl: number
    fc: number
    fs: number
    mais_menos: number
    val: number
}

export async function fetchGameDetail(internalID: string): Promise<FPBGameDetail | null> {
    const params = new URLSearchParams({ internalID })
    const res = await fetch(`${FPB_PROXY}?${params.toString()}`)
    if (!res.ok) return null
    const html = await res.text()
    return scrapeGameDetail(html, internalID)
}

function scrapeGameDetail(html: string, internalID: string): FPBGameDetail | null {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    // Date & phase
    const dataEl = doc.querySelector('.date, h3.date, .game-date')
    const data = dataEl?.textContent?.trim() || ''

    const faseEl = doc.querySelector('.competition-phase, .fase, .wrapper-title h4')
    const fase = faseEl?.textContent?.trim() || ''

    // Teams & score
    const homeEl = doc.querySelector('.home-team .team-name, .team-home .name, .equipa-casa .nome')
    const awayEl = doc.querySelector('.away-team .team-name, .team-away .name, .equipa-fora .nome')
    const equipa_casa = homeEl?.textContent?.trim() || ''
    const equipa_fora = awayEl?.textContent?.trim() || ''

    const scoreHomeEl = doc.querySelector('.home-score, .score-home, .resultado-casa')
    const scoreAwayEl = doc.querySelector('.away-score, .score-away, .resultado-fora')
    const resultado_casa = parseInt(scoreHomeEl?.textContent?.trim() || '0') || 0
    const resultado_fora = parseInt(scoreAwayEl?.textContent?.trim() || '0') || 0

    // Parciais (by quarter)
    const parciais: FPBGameDetail['parciais'] = []
    const quarterEls = doc.querySelectorAll('.quarter, .parcial')
    quarterEls.forEach(el => {
        const text = el.textContent?.trim() || ''
        const match = text.match(/(Q\d+|1T|2T|OT)\s*:?\s*(\d+)\s*[-–]\s*(\d+)/i)
        if (match) {
            parciais.push({ periodo: match[1], casa: parseInt(match[2]), fora: parseInt(match[3]) })
        }
    })

    // Pavilhao
    const pavilhaoEl = doc.querySelector('.location, .pavilhao, .venue')
    const pavilhao = pavilhaoEl?.textContent?.trim() || ''

    // Espetadores
    const espEl = doc.querySelector('.spectators, .espetadores')
    const espetadores = parseInt(espEl?.textContent?.trim() || '0') || 0

    // Game Leaders
    const gameLeaders: FPBGameDetail['gameLeaders'] = []
    const leaderEls = doc.querySelectorAll('.game-leaders .leader-row, .leaders .item')
    leaderEls.forEach(el => {
        const cat = el.querySelector('.category, .label')?.textContent?.trim() || ''
        const home = el.querySelector('.home-val, .home .value')?.textContent?.trim() || ''
        const away = el.querySelector('.away-val, .away .value')?.textContent?.trim() || ''
        gameLeaders.push({ categoria: cat, casa: { nome: '', valor: home }, fora: { nome: '', valor: away } })
    })

    // Box Score
    const boxScoreCasa: FPBBoxScorePlayer[] = []
    const boxScoreFora: FPBBoxScorePlayer[] = []
    const boxTables = doc.querySelectorAll('.box-score table, .stats-table, table.stats')
    boxTables.forEach((table, idx) => {
        const roster: FPBBoxScorePlayer[] = idx === 0 ? boxScoreCasa : boxScoreFora
        table.querySelectorAll('tbody tr').forEach(row => {
            const cols = row.querySelectorAll('td')
            if (cols.length < 5) return
            roster.push({
                numero: parseInt(cols[0]?.textContent?.trim() || '0') || 0,
                nome: cols[1]?.textContent?.trim() || '',
                min: cols[2]?.textContent?.trim() || '',
                pts: parseInt(cols[3]?.textContent?.trim() || '0') || 0,
                l2: cols[4]?.textContent?.trim() || '',
                l2pct: cols[5]?.textContent?.trim() || '',
                l3: cols[6]?.textContent?.trim() || '',
                l3pct: cols[7]?.textContent?.trim() || '',
                ll: cols[8]?.textContent?.trim() || '',
                llpct: cols[9]?.textContent?.trim() || '',
                ro: parseInt(cols[10]?.textContent?.trim() || '0') || 0,
                rd: parseInt(cols[11]?.textContent?.trim() || '0') || 0,
                rt: parseInt(cols[12]?.textContent?.trim() || '0') || 0,
                as: parseInt(cols[13]?.textContent?.trim() || '0') || 0,
                rb: parseInt(cols[14]?.textContent?.trim() || '0') || 0,
                to: parseInt(cols[15]?.textContent?.trim() || '0') || 0,
                dl: parseInt(cols[16]?.textContent?.trim() || '0') || 0,
                fc: parseInt(cols[17]?.textContent?.trim() || '0') || 0,
                fs: parseInt(cols[18]?.textContent?.trim() || '0') || 0,
                mais_menos: parseInt(cols[19]?.textContent?.trim() || '0') || 0,
                val: parseFloat(cols[20]?.textContent?.trim() || '0') || 0,
            })
        })
    })

    // Team Stats
    const teamStats: FPBGameDetail['teamStats'] = []
    const statRows = doc.querySelectorAll('.team-stats .stat-row, .comparison .row')
    statRows.forEach(row => {
        const label = row.querySelector('.label')?.textContent?.trim() || ''
        const casa = row.querySelector('.home')?.textContent?.trim() || ''
        const fora = row.querySelector('.away')?.textContent?.trim() || ''
        if (label) teamStats.push({ label, casa, fora })
    })

    return {
        internalID, data, fase, equipa_casa, equipa_fora,
        resultado_casa, resultado_fora, parciais, pavilhao, espetadores,
        gameLeaders, boxScoreCasa, boxScoreFora, teamStats,
    }
}
