import type { Club } from './ClubContext'

/**
 * Strip accents + lowercase for accent-insensitive search.
 */
export function normalize(s: string): string {
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

/**
 * Build an acronym from the first letter of each word in a string.
 * "Futebol Clube de Gaia" → "fcdg"
 */
function acronym(s: string): string {
    return normalize(s)
        .split(/\s+/)
        .map(w => w.charAt(0))
        .join('')
}

/**
 * Build a combined, normalized search string from a club.
 *
 * Uses **all** fields — name, search_name, and the acronym — so that
 * abbreviations like "FC", "GD", "SC" match clubs whose full name
 * spells out "Futebol Clube", "Grupo Desportivo", "Sporting Clube", etc.
 */
export function buildSearchText(club: Club): string {
    const nameNorm = normalize(club.name)
    const searchNorm = normalize(club.search_name || '')
    const acro = acronym(club.name)

    // Also try acronym from search_name if different (e.g. "fcporto" → "fp")
    const acro2 = club.search_name ? acronym(club.search_name) : ''
    const uniqueAcros = [...new Set([acro, acro2].filter(Boolean))].join(' ')

    // Join all searchable tokens with a space so partial words match
    // e.g. "futebol clube de gaia futebolclubedegaia fcdg"
    return [nameNorm, searchNorm, uniqueAcros].filter(Boolean).join(' ')
}
