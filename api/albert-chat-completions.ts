// Same-origin proxy to Albert API's POST /v1/chat/completions — see
// albert-models.ts for why this exists. Stateless relay: the token and
// request body come in, get forwarded as-is, response streamed back.
export const config = { runtime: 'edge' }

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const authorization = request.headers.get('authorization')
  if (!authorization) {
    return new Response(
      JSON.stringify({ error: 'Missing Authorization header' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    )
  }

  const albertResponse = await fetch(
    'https://albert.api.etalab.gouv.fr/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        authorization,
        'content-type': 'application/json'
      },
      body: await request.text()
    }
  )
  const body = await albertResponse.text()
  return new Response(body, {
    status: albertResponse.status,
    headers: { 'content-type': 'application/json' }
  })
}
