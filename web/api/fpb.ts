export const config = {
    runtime: 'edge',
}

export default async function handler(request: Request) {
    const url = new URL(request.url)
    const clube = url.searchParams.get('clube') || '119'
    const epoca = url.searchParams.get('epoca') || '2025/2026'
    const page = url.searchParams.get('page') || 'calendario'

    const fpbUrl = `https://www.fpb.pt/${page}/clube_${clube}/?epoca=${epoca}&escalao=S%C3%A9nior&genero=masculino`

    try {
        const fpbRes = await fetch(fpbUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        })

        const text = await fpbRes.text()

        return new Response(text, {
            status: fpbRes.status,
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=60'
            }
        })
    } catch (err) {
        return new Response(JSON.stringify({ error: 'Failed to fetch FPB' }), {
            status: 502,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}
