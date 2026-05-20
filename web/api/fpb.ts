export const config = {
    runtime: 'edge',
}

export default async function handler(request: Request) {
    const url = new URL(request.url)
    const searchParams = url.searchParams

    const fpbUrl = new URL('https://www.fpb.pt/wp-admin/admin-ajax.php')
    searchParams.forEach((value, key) => {
        fpbUrl.searchParams.append(key, value)
    })

    try {
        const fpbRes = await fetch(fpbUrl.toString(), {
            headers: {
                'User-Agent': 'FCGaia-Web/1.0 (+https://fcgaia.vercel.app)'
            }
        })

        const text = await fpbRes.text()

        return new Response(text, {
            status: fpbRes.status,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=60'
            }
        })
    } catch (err) {
        return new Response(JSON.stringify({ error: 'Failed to fetch FPB API' }), {
            status: 502,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}
