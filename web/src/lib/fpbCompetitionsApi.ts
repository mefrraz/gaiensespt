const FPB_PROXY = '/api/fpb-api'

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

async function fetchFromProxy(path: string): Promise<any> {
    const res = await fetch(`${FPB_PROXY}?path=${encodeURIComponent(path)}`)
    if (!res.ok) {
        if (res.status === 404) return null
        throw new Error(`FPB API error: ${res.status}`)
    }
    return res.json()
}

export async function fetchStandings(provaId: number): Promise<FPBStandingTeam[]> {
    const data = await fetchFromProxy(`classificacao/${provaId}`)
    return data || []
}

export async function fetchSchedule(provaId: number): Promise<FPBGame[]> {
    const data = await fetchFromProxy(`agenda/prova/${provaId}`)
    return data || []
}

export async function fetchResults(provaId: number): Promise<FPBGame[]> {
    const data = await fetchFromProxy(`resultados/prova/${provaId}`)
    return data || []
}

export async function fetchTeams(provaId: number): Promise<FPBTeam[]> {
    const data = await fetchFromProxy(`equipas/prova/${provaId}`)
    return data || []
}

export async function fetchPlayerStats(provaId: number, tipo: string = 'val'): Promise<FPBPlayerStat[]> {
    const data = await fetchFromProxy(`estatisticas/prova/${provaId}?tipo=${tipo}`)
    return data || []
}

export async function fetchMVP(provaId: number): Promise<FPBPlayerStat[]> {
    const data = await fetchFromProxy(`mvp/prova/${provaId}`)
    return data || []
}
