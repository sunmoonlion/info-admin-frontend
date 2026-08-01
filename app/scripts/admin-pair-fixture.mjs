import { createServer } from 'node:http'

const host = '127.0.0.1'
const port = Number(process.env.PAIR_FIXTURE_PORT ?? 18080)
const allowedOrigin = process.env.PAIR_ORIGIN ?? 'http://127.0.0.1:3009'
const cookieName = 'sunmoonai_tpl_admin_sid'

function sendJson(response, status, body, headers = {}) {
  response.writeHead(status, {
    'cache-control': 'no-store',
    'content-type': 'application/json',
    ...headers,
  })
  response.end(JSON.stringify(body))
}

const server = createServer((request, response) => {
  const url = new URL(request.url ?? '/', allowedOrigin)

  if (request.method === 'GET' && url.pathname === '/api/health') {
    sendJson(response, 200, { status: 'ok', surface: 'admin' })
    return
  }

  if (request.method === 'GET' && url.pathname === '/api/auth/me') {
    const cookie = request.headers.cookie ?? ''
    const authenticated =
      cookie.includes(`${cookieName}=e2e-session`) ||
      cookie.includes(`${cookieName}=operator-session`)
    if (!authenticated) {
      sendJson(response, 401, { detail: 'unauthenticated' })
      return
    }
    sendJson(response, 200, {
      contract_version: 1,
      authenticated: true,
      user: {
        actor_id: 'b42cf3bb-d63e-5df5-a884-9c34286f2608',
        app: 'tpl',
        surface: 'admin',
        display_name: 'Paired E2E User',
        email: 'admin@example.test',
        roles: cookie.includes(`${cookieName}=operator-session`) ? ['operator'] : ['admin'],
        scopes: ['tpl:admin'],
        expires_at: '2027-07-22T06:00:00.000Z',
      },
      csrf_token: 'csrf-token-value-that-is-long-enough-1234',
    })
    return
  }

  sendJson(response, 404, { detail: 'not_found' })
})

server.listen(port, host, () => {
  process.stdout.write(`admin pair fixture listening on http://${host}:${port}\n`)
})

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)))
}
