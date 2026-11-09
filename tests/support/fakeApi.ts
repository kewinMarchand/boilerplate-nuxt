import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { expect } from '@playwright/test'

import type { ChildProcess } from 'node:child_process'
import type { IncomingMessage, Server } from 'node:http'

export const REAL_API = process.env.NUXT_PUBLIC_API_URL ?? 'http://localhost:8090'

/** Réponses remplacées par l'API factice, à partir de la réponse réelle quand elle sert de base. */
export type ApiOverrides = Record<string, (upstream: unknown) => unknown>

const readBody = async (request: IncomingMessage) => {
  const chunks: Buffer[] = []
  for await (const chunk of request) chunks.push(Buffer.from(chunk))
  return chunks.length ? Buffer.concat(chunks) : undefined
}

/**
 * API factice : sert les réponses remplacées et relaie tout le reste à l'API réelle (méthode et corps
 * compris), sans toucher à sa base. Le navigateur l'appelle aussi : elle répond au CORS de l'origine du
 * build, que l'API réelle ne connaît pas.
 */
const startFakeApi = (port: number, overrides: ApiOverrides) =>
  createServer(async (request, response) => {
    const cors = {
      'access-control-allow-origin': request.headers.origin ?? '*',
      'access-control-allow-methods': 'GET, POST, OPTIONS',
      'access-control-allow-headers': 'content-type, accept',
    }
    if (request.method === 'OPTIONS') {
      response.writeHead(204, cors).end()
      return
    }
    const body = await readBody(request)
    const upstream = await fetch(new URL(request.url ?? '/', REAL_API), {
      method: request.method,
      headers: {
        accept: request.headers.accept ?? '*/*',
        ...(request.headers['content-type'] && { 'content-type': request.headers['content-type'] }),
      },
      ...(body && { body }),
    })
    // Le front passe la langue de la page à chaque lecture : la réponse remplacée vaut pour toutes
    const path = new URL(request.url ?? '/', REAL_API)
    path.searchParams.delete('locale')
    const override = overrides[`${path.pathname}${path.search}`]
    if (override) {
      response
        .writeHead(200, { ...cors, 'content-type': 'application/json' })
        .end(JSON.stringify(override(await upstream.json())))
      return
    }
    response
      .writeHead(upstream.status, {
        ...cors,
        'content-type': upstream.headers.get('content-type') ?? '',
      })
      .end(Buffer.from(await upstream.arrayBuffer()))
  }).listen(port)

/** Sert le build sur `appPort` ; son serveur et le navigateur appellent l'API factice de `fakeApiPort`. */
export const serveWithFakeApi = async (
  appPort: number,
  fakeApiPort: number,
  overrides: ApiOverrides,
) => {
  const appUrl = `http://localhost:${appPort}`
  const fakeApi: Server = startFakeApi(fakeApiPort, overrides)
  const app: ChildProcess = spawn('node', ['.output/server/index.mjs'], {
    env: {
      ...process.env,
      PORT: String(appPort),
      NUXT_PUBLIC_SITE_URL: appUrl,
      NUXT_API_URL: `http://localhost:${fakeApiPort}`,
      NUXT_PUBLIC_API_URL: `http://localhost:${fakeApiPort}`,
    },
    stdio: 'ignore',
  })
  await expect
    .poll(async () => (await fetch(appUrl).catch(() => null))?.status, { timeout: 30_000 })
    .toBe(200)
  return {
    appUrl,
    stop: () => {
      app.kill()
      fakeApi.close()
    },
  }
}
