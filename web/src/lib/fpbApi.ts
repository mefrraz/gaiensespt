import { Match } from '../components/types'

const FPB_PROXY = '/api/fpb'

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

export async function fetchFPBGames(
  epoca: string,
  clube: number = 119
): Promise<Match[]> {
  const [calHtml, resHtml] = await Promise.all([
    fetchPage('calendario', clube, epoca),
    fetchPage('resultados', clube, epoca)
  ])

  const calGames = parseGamesHTML(calHtml)
  const resGames = parseGamesHTML(resHtml)

  // Merge: results page games override calendar page games (has scores)
  const merged = new Map<string, Match>()
  for (const g of calGames) merged.set(g.id, g)
  for (const g of resGames) merged.set(g.id, { ...merged.get(g.id), ...g })

  return Array.from(merged.values())
}

async function fetchPage(page: string, clube: number, epoca: string): Promise<string> {
  const params = new URLSearchParams()
  params.append('page', page)
  params.append('clube', String(clube))
  params.append('epoca', epoca)

  const res = await fetch(`${FPB_PROXY}?${params.toString()}`)
  if (!res.ok) throw new Error(`FPB error: ${res.status}`)
  return res.text()
}

function parseGamesHTML(html: string): Match[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const games: Match[] = []

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
      if (!internalId) return

      // Teams: first .team-container = home, second = away
      const teamContainers = link.querySelectorAll('.team-container')
      const homeTeamEl = teamContainers[0]
      const awayTeamEl = teamContainers[1]

      const homeName = (homeTeamEl?.querySelector('.fullName') || homeTeamEl?.querySelector('.sigla'))?.textContent?.trim() || ''
      const awayName = (awayTeamEl?.querySelector('.fullName') || awayTeamEl?.querySelector('.sigla'))?.textContent?.trim() || ''

      // Logos
      const homeLogo = homeTeamEl?.querySelector('.image-container img')?.getAttribute('src') || null
      const awayLogo = awayTeamEl?.querySelector('.image-container img')?.getAttribute('src') || null

      // Competition
      const compEl = link.querySelector('.competition span')
      const compText = compEl?.textContent?.trim() || ''
      let escalao = ''
      let competicao = ''
      if (compText.includes('|')) {
        const parts = compText.split('|')
        escalao = parts[0]?.trim() || ''
        competicao = parts[1]?.trim() || ''
      } else {
        competicao = compText
      }

      // Location
      const locEl = link.querySelector('.location-wrapper b')
      const local = locEl?.textContent?.trim() || null

      // STATUS & SCORES
      let status: Match['status'] = 'AGENDADO'
      let resultado_casa: number | null = null
      let resultado_fora: number | null = null
      let hora = ''

      // Check for completed (results_wrapper)
      const resultsWrapper = link.querySelector('.results_wrapper')
      if (resultsWrapper) {
        const scoreEls = resultsWrapper.querySelectorAll('h3.results_text')
        if (scoreEls.length >= 2) {
          status = 'FINALIZADO'
          resultado_casa = parseInt(scoreEls[0].textContent?.trim() || '0') || null
          resultado_fora = parseInt(scoreEls[1].textContent?.trim() || '0') || null
        }
      }

      // Fallback: check for victory_font class
      if (status === 'AGENDADO' && link.querySelector('.victory_font')) {
        status = 'FINALIZADO'
      }

      // Fallback: time text might show score pattern "78-65"
      const hourEl = link.querySelector('.hour h3')
      const hourText = hourEl?.textContent?.trim() || ''
      if (status === 'AGENDADO' && hourText.includes('-') && !hourText.includes('H')) {
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

      // Time
      if (status === 'AGENDADO') {
        hora = (hourText || '').replace('H', ':').replace(/\s+/g, '')
      }

      const slug = `${isoDate}-${slugify(homeName)}-${slugify(awayName)}`

      games.push({
        id: internalId,
        slug,
        data: isoDate,
        hora,
        equipa_casa: homeName.trim(),
        equipa_fora: awayName.trim(),
        resultado_casa,
        resultado_fora,
        escalao: escalao.trim(),
        competicao: competicao.trim(),
        local,
        logotipo_casa: homeLogo,
        logotipo_fora: awayLogo,
        status,
        epoca: ''
      })
    })
  })

  return games
}
