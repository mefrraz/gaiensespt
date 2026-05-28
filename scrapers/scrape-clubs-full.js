import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'
import * as fs from 'fs'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const USER_AGENT = 'Mozilla/5.0 (compatible; Dribly-Bot/1.0)'

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_KEY in .env')
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function main() {
    console.log('Fetching https://www.fpb.pt/clubes/ ...')
    const res = await fetch('https://www.fpb.pt/clubes/', {
        headers: { 'User-Agent': USER_AGENT }
    })
    if (!res.ok) {
        console.error('Failed to fetch clubs page:', res.status)
        process.exit(1)
    }
    const html = await res.text()

    // Parse club cards
    const clubRegex = /<div class="clube visible ">\s*<a href="\/calendario\/clube_(\d+)">\s*<div class="clube-head"[^>]*><\/div>\s*<div class="clube-body"\s*style='background-color:(#[^']+)'[^>]*>\s*(?:<img[^>]+src="([^"]+)"[^>]*>)?\s*<div class="clube-shortname">([^<]*)<\/div>\s*<div class="clube-name">([^<]*)<\/div>\s*<div class="clube-local">([^<]*)<\/div>\s*<div class="clube-region">([^<]*)<\/div>/g

    const clubs = []
    let match
    while ((match = clubRegex.exec(html)) !== null) {
        clubs.push({
            id: parseInt(match[1]),
            name: match[5].trim(),
            short_name: match[4].trim(),
            color: match[2].trim(),
            logo_url: match[3] ? match[3].trim() : null,
            local: match[6].trim(),
            region: match[7].trim(),
        })
    }

    console.log('Found ' + clubs.length + ' clubs')

    const colorCounts = {}
    clubs.forEach(c => {
        colorCounts[c.color] = (colorCounts[c.color] || 0) + 1
    })
    console.log('Color distribution:')
    Object.entries(colorCounts).sort((a, b) => b[1] - a[1]).forEach(([color, count]) => {
        console.log('  ' + color + ': ' + count + ' clubs')
    })

    fs.writeFileSync('scraped_clubs.json', JSON.stringify(clubs, null, 2), 'utf8')
    console.log('Saved to scraped_clubs.json')

    let updated = 0
    let errors = 0
    for (const club of clubs) {
        const color = club.color
        const isBlack = color === '#000000' || color === '#000'
        const updateData = {
            id: club.id,
            name: club.name,
            search_name: club.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
            slug: club.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
            primary_color: isBlack ? '#7C3AED' : color,
            logo_url: club.logo_url,
        }
        const result = await supabase.from('clubs').upsert(updateData, { onConflict: 'id' })
        if (result.error) {
            errors++
            if (errors <= 3) console.error('  Error upserting ' + club.id + ': ' + result.error.message)
        } else {
            updated++
        }
    }

    console.log('Supabase update: ' + updated + ' upserted, ' + errors + ' errors')
    console.log('Black-colored clubs set to #7C3AED (purple)')
}

main()
