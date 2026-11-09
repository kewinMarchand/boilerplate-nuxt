import { useRequestHeader, useRuntimeConfig } from '#imports'

import { useLocaleState } from '@/shared/i18n/route'

import { createApiClient } from './client'

/**
 * Client de la requête en cours, à créer dans un `setup` : origine relue à l'exécution
 * (`runtimeConfig.public.apiUrl`, alimentée par `API_URL` ; côté serveur, `runtimeConfig.apiUrl`
 * si `NUXT_API_URL` est fournie) et, côté serveur, `X-Scenario` reçu relayé à l'API. Dans le
 * navigateur, l'en-tête éventuel est posé par le client lui-même. `NUXT_PUBLIC_API_SCENARIO` fixe
 * un scénario pour tous les appels. Chaque lecture passe la langue de la page, connue une fois
 * l'identité du site lue (l'identité elle-même précise la sienne).
 */
export const useApiClient = () => {
  const config = useRuntimeConfig()
  const locale = useLocaleState().value?.locale
  const scenario = config.public.apiScenario || null
  return import.meta.server
    ? createApiClient(
        config.apiUrl || config.public.apiUrl,
        useRequestHeader('x-scenario') ?? scenario,
        locale,
      )
    : createApiClient(config.public.apiUrl, scenario, locale)
}
