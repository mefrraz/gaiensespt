import { createContext, useContext } from 'react'
import { Match } from '../components/types'

export type GameData = {
    games: Match[]
    loading: boolean
    lastUpdated: Date | null
    error: string | null
    refresh: () => Promise<void>
}

export const GameDataContext = createContext<GameData | null>(null)

export function useGameData(): GameData {
    const ctx = useContext(GameDataContext)
    if (!ctx) throw new Error('useGameData must be used within GameDataProvider')
    return ctx
}
