export const config = {
    runtime: 'edge',
}

export default async function handler(request: Request) {
    const url = new URL(request.url)
    const endpoint = url.searchParams.get('endpoint')

    // Proxy mode: forward to sav2.fpb.pt API
    if (endpoint) {
        const fpbRes = await fetch(`https://sav2.fpb.pt/api/${endpoint}`, {
            headers: {
                'User-Agent': 'Dribly/1.0',
                'Accept': 'application/json',
            },
        })

        const text = await fpbRes.text()
        const contentType = fpbRes.headers.get('content-type') || 'application/json'

        return new Response(text, {
            status: fpbRes.status,
            headers: {
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
            },
        })
    }

    // Original HTML scraping mode
    const clube = url.searchParams.get('clube') || '119'
    const epoca = url.searchParams.get('epoca') || '2025/2026'
    const page = url.searchParams.get('page') || 'calendario'

    const fpbUrl = `https://www.fpb.pt/${page}/clube_${clube}/?epoca=${epoca}&escalao=S%C3%A9nior&genero=masculino`

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    try {
        const fpbRes = await fetch(fpbUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml',
            },
            signal: controller.signal,
        })

        clearTimeout(timeout)

        if (!fpbRes.ok) {
            return new Response(JSON.stringify({ error: `FPB returned ${fpbRes.status}` }), {
                status: 502,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            })
        }

        const text = await fpbRes.text()

        return new Response(text, {
            status: 200,
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=60',
                'Access-Control-Allow-Origin': '*'
            }
        })
    } catch (err: any) {
        clearTimeout(timeout)
        const message = err?.name === 'AbortError' ? 'FPB request timed out' : 'Failed to fetch FPB'
        return new Response(JSON.stringify({ error: message }), {
            status: 502,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        })
    }
}
