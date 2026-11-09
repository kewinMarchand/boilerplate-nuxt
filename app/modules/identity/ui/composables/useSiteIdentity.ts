import { useQuery } from '@tanstack/vue-query'
import { computed } from 'vue'
import { useHead, useRequestEvent, useSeoMeta } from '#imports'

import { useRequestedLocale } from '@/shared/i18n/route'
import { useDefaultSeoImage } from '@/shared/seo'
import { largestWebp } from '@/shared/ui/kit'

import { EMPTY_PAGE_METAS } from '@/modules/identity/domain/pageMeta'
import { useSiteIdentityRepository } from '@/modules/identity/infrastructure/useSiteIdentityRepository'
import { FALLBACK_IDENTITY } from '@/modules/identity/ui/siteIdentityFallback'
import { themeCss } from '@/modules/identity/ui/themeCss'

import type { PageMeta } from '@/modules/identity/domain/pageMeta'
import type { SiteIdentity } from '@/modules/identity/domain/siteIdentity'
import type { Ref } from 'vue'

const FRONT_ICON_LINKS = [
  { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
  { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
  { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
] as const

/**
 * Identité du site, lue une fois par requête serveur puis réhydratée, jamais relue par le navigateur :
 * sans préfixe de langue, elle est demandée sans langue, et le navigateur enverrait la sienne
 * (`Accept-Language`). API en erreur : la configuration du front, la page reste servie. À attendre
 * dans le `setup`, comme l'arbre des catégories.
 */
export const useSiteIdentity = async () => {
  const repository = useSiteIdentityRepository()
  const requestedLocale = useRequestedLocale()
  const query = useQuery({
    queryKey: ['identity', requestedLocale],
    queryFn: () =>
      repository.find(requestedLocale).catch((error: unknown) => {
        console.error(error)
        return FALLBACK_IDENTITY
      }),
    staleTime: Infinity,
  })
  await (import.meta.server ? query.suspense() : Promise.resolve())
  return computed(() => query.data.value ?? FALLBACK_IDENTITY)
}

/**
 * Titre et description saisis pour une page fixe, chaînes vides si non saisis ou API en erreur.
 * À attendre dans le `setup`, comme l'identité.
 */
export const usePageMeta = async (page: PageMeta.Key) => {
  const repository = useSiteIdentityRepository()
  const query = useQuery({
    queryKey: ['page-metas'],
    queryFn: () =>
      repository.findPageMetas().catch((error: unknown) => {
        console.error(error)
        return EMPTY_PAGE_METAS
      }),
  })
  await (import.meta.server ? query.suspense() : Promise.resolve())
  return computed(() => (query.data.value ?? EMPTY_PAGE_METAS)[page])
}

/**
 * En-tête commun à toutes les pages : modèle de titre, `og:site_name`, favicons, image de partage par défaut,
 * couleurs de marque et thème servi par défaut.
 */
export const useSiteIdentityHead = (identity: Readonly<Ref<SiteIdentity.Entity>>) => {
  const { shareImage } = identity.value
  if (shareImage) {
    useDefaultSeoImage().value = {
      path: largestWebp(shareImage),
      width: shareImage.width,
      height: shareImage.height,
      alt: shareImage.alt || identity.value.name,
    }
  }
  if (import.meta.server) {
    const event = useRequestEvent()
    // Lu par le plugin Nitro colorScheme, qui écrit l'attribut dans le HTML servi
    if (event) event.context.defaultColorScheme = identity.value.defaultColorScheme
  }
  useHead({
    titleTemplate: (title) => (title ? `${title} · ${identity.value.name}` : identity.value.name),
    link: () => {
      const { icon } = identity.value
      return icon
        ? [
            { rel: 'icon', type: 'image/png', sizes: '32x32', href: icon.png32 } as const,
            { rel: 'apple-touch-icon', sizes: '180x180', href: icon.png180 } as const,
          ]
        : [...FRONT_ICON_LINKS]
    },
    style: () => {
      const { theme } = identity.value
      return theme ? [{ key: 'site-theme', id: 'site-theme', innerHTML: themeCss(theme) }] : []
    },
  })
  useSeoMeta({ ogSiteName: () => identity.value.name })
}
