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
