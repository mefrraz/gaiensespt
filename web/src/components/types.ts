export interface Standing {
    id: string
    competicao: string
    grupo: string
    equipa: string
    posicao: number
    jogos: number
    vitorias: number
    derrotas: number
    pontos: number
    forma?: ('W' | 'L')[]
}

export type Match = {
    id: string
    slug: string
    data: string
    hora: string
    equipa_casa: string
    equipa_fora: string
    resultado_casa: number | null
    resultado_fora: number | null
    escalao: string
    competicao: string
    local: string | null
    logotipo_casa: string | null
    logotipo_fora: string | null
    status: 'AGENDADO' | 'A DECORRER' | 'FINALIZADO'
    epoca?: string
    createdAt?: string
    updatedAt?: string
}
