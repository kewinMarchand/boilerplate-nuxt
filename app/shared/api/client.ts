import createClient from 'openapi-fetch'

import type { paths } from './schema'

export type { components, operations } from './schema'

export type ApiClient = ReturnType<typeof createApiClient>

/**
 * Client typé de l'API. `X-Scenario` (error, empty, bilingual) n'a d'effet qu'en dev et en test côté
 * API : le relayer permet aux tests e2e de provoquer les états d'erreur et de liste vide, ou d'activer
 * l'anglais. `locale` (langue de la page) est ajoutée à chaque lecture qui n'en précise pas : paramètre
 * plutôt qu'en-tête, la clé de cache reste explicite.
 */
export const createApiClient = (baseUrl: string, scenario?: string | null, locale?: string) => {
  const client = createClient<paths, 'application/json'>({
    baseUrl,
    headers: scenario ? { 'X-Scenario': scenario } : {},
  })
  if (locale) {
    client.use({
      onRequest: ({ request }) => {
        const url = new URL(request.url)
        // Lectures seulement : un envoi (contact) passe sa langue en `Accept-Language`
        if (request.method !== 'GET' || url.searchParams.has('locale')) return request
        url.searchParams.set('locale', locale)
        return new Request(url, request)
      },
    })
  }
  return client
}

export class ApiError extends Error {
  constructor(response: Response) {
    super(`Réponse ${response.status} de l'API (${response.url})`)
    this.name = 'ApiError'
  }
}
