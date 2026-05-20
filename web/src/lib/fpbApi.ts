import { Match } from '../components/types'

const FPB_PROXY = '/api/fpb/admin-ajax.php'

const MONTHS_PT: Record<string, number> = {
  'JAN': 1, 'FEV': 2, 'MAR': 3, 'ABR': 4, 'MAI': 5, 'JUN': 6,
  'JUL': 7, 'AGO': 8, 'SET': 9, 'OUT': 10, 'NOV': 11, 'DEZ': 12,
  'JANEIRO': 1, 'FEVEREIRO': 2, 'MARÇO': 3, 'ABRIL': 4, 'MAIO': 5, 'JUNHO': 6,
  'JULHO': 7, 'AGOSTO': 8, 'SETEMBRO': 9, 'OUTUBRO': 10, 'NOVEMBRO': 11, 'DEZEMBRO': 12
}

const WEEKDAYS_PT = [
  'domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado',
  'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira',
  'sábado'
]

function parseDatePt(dateStr: string): string | null {
  if (!dateStr) return null
  const cleaned = dateStr.replace(/,/g, '').trim().toUpperCase()
  const parts = cleaned.split(/\s+/).filter(p => {
    const normalized = p.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    return !WEEKDAYS_PT.includes(normalized)
  })
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
  clube?: number,
  competicao?: number,
  escalao = 'Sénior',
  genero = 'masculino'
): Promise<Match[]> {
  const params = new URLSearchParams()
  params.append('action', 'get_more_days')
  params.append('epoca', epoca)
  params.append('escalao', escalao)
  params.append('genero', genero)
  params.append('period[time_option]', 'fromInit')
  params.append('period[from_date]', `${epoca.split('/')[0]}/09/01`)
  params.append('period[to_date]', `20${epoca.split('/')[1]}/07/31`)
  if (clube) params.append('clube', String(clube))
  if (competicao) params.append('competicao[]', String(competicao))

  const res = await fetch(`${FPB_PROXY}?${params.toString()}`)
  if (!res.ok) throw new Error(`FPB API error: ${res.status}`)
  const json = await res.json()
  return parseGamesHTML(json.result)
}

function parseGamesHTML(html: string): Match[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const games: Match[] = []

  const dayWrappers = doc.querySelectorAll('.day-wrapper')
  dayWrappers.forEach(dayWrapper => {
    const dateEl = dayWrapper.querySelector('.day-header span')
    const dateStr = dateEl?.textContent?.trim() || ''
    const isoDate = parseDatePt(dateStr)
    if (!isoDate) return

    const jogoLinks = dayWrapper.querySelectorAll('a.jogo')
    jogoLinks.forEach((link: Element) => {
      const href = link.getAttribute('href') || ''
      const internalId = href.match(/internalID=(\d+)/)?.[1] || ''
      if (!internalId) return

      const stateEl = link.querySelector('.state')
      const stateText = stateEl?.textContent?.trim().toUpperCase() || ''
      let status: Match['status'] = 'AGENDADO'
      if (stateText.includes('TERMINADO')) status = 'FINALIZADO'
      else if (stateText.includes('DECORRER') || stateText.includes('LIVE')) status = 'A DECORRER'

      const homeEl = link.querySelector('.team.home')
      const awayEl = link.querySelector('.team.away')

      const homeName = homeEl?.querySelector('.name')?.textContent?.trim() || ''
      const awayName = awayEl?.querySelector('.name')?.textContent?.trim() || ''

      const homeScore = parseInt(homeEl?.querySelector('.score')?.textContent || '0') || null
      const awayScore = parseInt(awayEl?.querySelector('.score')?.textContent || '0') || null

      const homeLogo = homeEl?.querySelector('img')?.getAttribute('src') || null
      const awayLogo = awayEl?.querySelector('img')?.getAttribute('src') || null

      const compEl = link.querySelector('.meta .competition')
      const competicao = compEl?.textContent?.trim() || ''

      const pavilionEl = link.querySelector('.meta .pavilion')
      const local = pavilionEl?.textContent?.trim() || null

      const slug = `${isoDate}-${slugify(homeName)}-${slugify(awayName)}`

      const hora = status === 'AGENDADO' ? stateText : ''

      games.push({
        id: internalId,
        slug,
        data: isoDate,
        hora,
        equipa_casa: homeName,
        equipa_fora: awayName,
        resultado_casa: status === 'FINALIZADO' ? homeScore : null,
        resultado_fora: status === 'FINALIZADO' ? awayScore : null,
        escalao: '', // not in the generic get_more_days HTML response
        competicao,
        local,
        logotipo_casa: homeLogo,
        logotipo_fora: awayLogo,
        status,
        epoca: '' // filled by hook
      })
    })
  })

  return games
}
