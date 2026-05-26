const FPB_API = 'https://sav2.fpb.pt/api'

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

export async function fetchStandings(provaId: number): Promise<FPBStandingTeam[]> {
    const res = await fetch(`${FPB_API}/classificacao/${provaId}`)
    if (!res.ok) return []
    return res.json()
}

export async function fetchSchedule(provaId: number): Promise<FPBGame[]> {
    const res = await fetch(`${FPB_API}/agenda/prova/${provaId}`)
    if (!res.ok) return []
    return res.json()
}

export async function fetchResults(provaId: number): Promise<FPBGame[]> {
    const res = await fetch(`${FPB_API}/resultados/prova/${provaId}`)
    if (!res.ok) return []
    return res.json()
}

export async function fetchTeams(provaId: number): Promise<FPBTeam[]> {
    const res = await fetch(`${FPB_API}/equipas/prova/${provaId}`)
    if (!res.ok) return []
    return res.json()
}

export async function fetchPlayerStats(provaId: number, tipo: string = 'val'): Promise<FPBPlayerStat[]> {
    const url = `${FPB_API}/estatisticas/prova/${provaId}?tipo=${tipo}`
    const res = await fetch(url)
    if (!res.ok) return []
    return res.json()
}

export async function fetchMVP(provaId: number): Promise<FPBPlayerStat[]> {
    const res = await fetch(`${FPB_API}/mvp/prova/${provaId}`)
    if (!res.ok) return []
    return res.json()
}
