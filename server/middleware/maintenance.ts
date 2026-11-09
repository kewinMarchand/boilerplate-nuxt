import { FALLBACK_LOCALE, pathLocale } from '@/shared/i18n/locale'

import { maintenancePage } from '@/views/errors/maintenancePage'

import { serverSiteIdentityRepository } from '@/modules/identity/index.server'

const RETRY_AFTER_SECONDS = 3600
const LOCALES_TIMEOUT_MS = 2000

/** Langues du site, `fr` si l'API, parfois arrêtée pendant la maintenance, ne répond pas à temps. */
const siteLocales = (apiUrl: string, scenario: string | null) =>
  Promise.race([
    serverSiteIdentityRepository(apiUrl, scenario)
      .find()
      .then(({ locales }) => locales),
    new Promise<string[]>((resolve) => setTimeout(resolve, LOCALES_TIMEOUT_MS, [FALLBACK_LOCALE])),
  ]).catch(() => [FALLBACK_LOCALE])

/** Page de maintenance dans la langue de l'adresse : son préfixe s'il désigne une langue activée, sinon la langue par défaut. */
export default defineEventHandler(async (event) => {
  if (process.env.MAINTENANCE !== '1') return
  const config = useRuntimeConfig(event)
  const locales = await siteLocales(
    config.apiUrl || config.public.apiUrl,
    getHeader(event, 'x-scenario') ?? (config.public.apiScenario || null),
  )
  setResponseStatus(event, 503)
  setHeader(event, 'retry-after', RETRY_AFTER_SECONDS)
  setHeader(event, 'content-type', 'text/html; charset=utf-8')
  return maintenancePage(pathLocale(event.path, locales))
})
