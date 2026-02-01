import { createEvents } from 'ics'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
    try {
        // Fetch upcoming games
        const { data: games, error } = await supabase
            .from('partidas')
            .select('*')
            .eq('status', 'AGENDADO')
            .gte('data', new Date().toISOString().split('T')[0]) // From today onwards

        if (error) throw error

        const events = games.map(game => {
            // Parse date (YYYY-MM-DD) and time (HH:MM or null)
            const dateParts = game.data.split('-').map(Number) // [2026, 2, 1]

            let start = [dateParts[0], dateParts[1], dateParts[2]]
            let duration = { hours: 1, minutes: 45 } // Default basketball game duration

            if (game.hora) {
                const timeParts = game.hora.split(':').map(Number)
                start.push(timeParts[0], timeParts[1])
            } else {
                // If no time, assume all day?? Or set a default?
                // Let's set it as "All Day" conceptually or just noon?
                // ICS handles it if we don't pass H/M? No, createEvents array expects it.
                // If unknown time, let's put 09:00 but maybe add Note?
                start.push(9, 0)
            }

            return {
                start,
                duration,
                title: `🏀 ${game.escalao}: ${game.equipa_casa} vs ${game.equipa_fora}`,
                description: `Competição: ${game.competicao}\nLocal: ${game.local || 'A definir'}\n\nMais info: https://gaiensespt.vercel.app/game/${game.slug}`,
                location: game.local || 'A definir',
                status: 'CONFIRMED',
                busyStatus: 'BUSY',
                url: `https://gaiensespt.vercel.app/game/${game.slug}`
            }
        })

        createEvents(events, (error, value) => {
            if (error) {
                console.error(error)
                return res.status(500).send('Error generating calendar')
            }

            res.setHeader('Content-Type', 'text/calendar')
            res.setHeader('Content-Disposition', 'attachment; filename="fcgaia-schedule.ics"')
            res.send(value)
        })

    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to fetch schedule' })
    }
}
