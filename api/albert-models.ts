// Same-origin proxy to Albert API's GET /v1/models, so ConfigEditorView.vue
// can call it from the browser without hitting Albert's CORS wall directly
// (confirmed: even Etalab's own web client goes through its own backend,
// not the browser, to reach albert.api.etalab.gouv.fr). Stateless relay —
// the token comes in on every request, is forwarded, and is never stored
// or logged here.
export const config = { runtime: 'edge' }

export default async function handler(request: Request): Promise<Response> {
  const authorization = request.headers.get('authorization')
  if (!authorization) {
    return new Response(
      JSON.stringify({ error: 'Missing Authorization header' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    )
  }

  const albertResponse = await fetch(
    'https://albert.api.etalab.gouv.fr/v1/models',
    { headers: { authorization } }
  )
  const body = await albertResponse.text()
  return new Response(body, {
    status: albertResponse.status,
    headers: { 'content-type': 'application/json' }
  })
}
