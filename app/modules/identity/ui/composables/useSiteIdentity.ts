import { useQuery } from '@tanstack/vue-query'
import { computed } from 'vue'
import { useHead, useRequestEvent, useSeoMeta } from '#imports'

import { useSiteIdentityRepository } from '@/modules/identity/infrastructure/useSiteIdentityRepository'
import { FALLBACK_IDENTITY } from '@/modules/identity/ui/siteIdentityFallback'
import { themeCss } from '@/modules/identity/ui/themeCss'

import type { SiteIdentity } from '@/modules/identity/domain/siteIdentity'
import type { Ref } from 'vue'

export const SITE_IDENTITY_QUERY_KEY = ['identity'] as const

/**
 * Identité du site, lue une fois par requête serveur puis réhydratée. API en erreur : la configuration
 * du front, la page reste servie. À attendre dans le `setup`, comme l'arbre des catégories.
 */
export const useSiteIdentity = async () => {
  const repository = useSiteIdentityRepository()
  const query = useQuery({
    queryKey: SITE_IDENTITY_QUERY_KEY,
    queryFn: () =>
      repository.find().catch((error: unknown) => {
        console.error(error)
        return FALLBACK_IDENTITY
      }),
  })
  await (import.meta.server ? query.suspense() : Promise.resolve())
  return computed(() => query.data.value ?? FALLBACK_IDENTITY)
}

/** En-tête commun à toutes les pages : modèle de titre, `og:site_name`, couleurs de marque et thème servi par défaut. */
export const useSiteIdentityHead = (identity: Readonly<Ref<SiteIdentity.Entity>>) => {
  if (import.meta.server) {
    const event = useRequestEvent()
    // Lu par le plugin Nitro colorScheme, qui écrit l'attribut dans le HTML servi
    if (event) event.context.defaultColorScheme = identity.value.defaultColorScheme
  }
  useHead({
    titleTemplate: (title) => (title ? `${title} · ${identity.value.name}` : identity.value.name),
    style: () => {
      const { theme } = identity.value
      return theme ? [{ key: 'site-theme', id: 'site-theme', innerHTML: themeCss(theme) }] : []
    },
  })
  useSeoMeta({ ogSiteName: () => identity.value.name })
}
