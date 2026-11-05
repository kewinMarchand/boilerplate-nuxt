import { useRequestHeader, useRuntimeConfig } from '#imports'

import { createApiClient } from './client'

/**
 * Client de la requête en cours, à créer dans un `setup` : origine relue à l'exécution
 * (`runtimeConfig.public.apiUrl`, alimentée par `API_URL` ; côté serveur, `runtimeConfig.apiUrl`
 * si `NUXT_API_URL` est fournie) et, côté serveur, `X-Scenario` reçu relayé à l'API. Dans le
 * navigateur, l'en-tête éventuel est posé par le client lui-même.
 */
export const useApiClient = () => {
  const config = useRuntimeConfig()
  return import.meta.server
    ? createApiClient(config.apiUrl || config.public.apiUrl, useRequestHeader('x-scenario'))
    : createApiClient(config.public.apiUrl)
}
