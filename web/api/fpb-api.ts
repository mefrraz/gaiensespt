export const config = {
    runtime: 'edge',
}

const FPB_API_BASE = 'https://sav2.fpb.pt/api'

export default async function handler(request: Request) {
    const url = new URL(request.url)
    const path = url.searchParams.get('path') || ''

    const fpbUrl = `${FPB_API_BASE}/${path}`
    const fpbRes = await fetch(fpbUrl, {
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
