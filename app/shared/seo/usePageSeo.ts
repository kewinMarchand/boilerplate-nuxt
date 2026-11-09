import { computed, toValue } from 'vue'
import { useHead, useRuntimeConfig, useSeoMeta, useState } from '#imports'

import { ALL_NAVIGATION, labelNavigation, SITE } from '@/shared/config'
import { localizePath, ogLocale, useDictionary, useLocale, usePageAlternates } from '@/shared/i18n'
import { usePagePath } from '@/shared/i18n/route'

import { buildBreadcrumb, toBreadcrumbJsonLd } from './breadcrumb'

import type { Breadcrumb } from './breadcrumb'
import type { MaybeRefOrGetter } from 'vue'

export interface SeoImage {
  path: string
  width: number
  height: number
  alt: string
}

export interface PageSeoInput {
  title: MaybeRefOrGetter<string>
  /** Titre saisi dans l'admin, servi tel quel, sans le nom du site ; vide : `title` et le modèle du site. */
  adminTitle?: MaybeRefOrGetter<string>
  description: MaybeRefOrGetter<string>
  image?: MaybeRefOrGetter<SeoImage | undefined>
  noindex?: MaybeRefOrGetter<boolean>
  /** Chemin sans préfixe de langue ; la page courante sans lui. */
  canonicalPath?: MaybeRefOrGetter<string>
  breadcrumbLabel?: string
  breadcrumbTrail?: MaybeRefOrGetter<Breadcrumb.Item[] | null>
  jsonLd?: MaybeRefOrGetter<Record<string, unknown>[]>
  /** Adresses des pages voisines, préfixe de langue compris. */
  pagination?: MaybeRefOrGetter<{ prev?: string; next?: string }>
  /** Page d'article : `og:type` article et date de publication (AAAA-MM-JJ). */
  publishedTime?: MaybeRefOrGetter<string | undefined>
}

const DEFAULT_IMAGE: SeoImage = {
  path: '/og-image.jpg',
  width: 1200,
  height: 630,
  alt: `${SITE.name} : jardin tropical`,
}

/**
 * Image de partage des pages qui n'en ont pas, remplaçable par l'identité du site.
 * État Nuxt et non `provide` : `error.vue` la pose et la lit dans le même composant.
 */
export const useDefaultSeoImage = () => useState<SeoImage>('default-seo-image', () => DEFAULT_IMAGE)

export const usePageSeo = (input: PageSeoInput) => {
  const pagePath = usePagePath()
  const defaultImage = useDefaultSeoImage()
  const { siteUrl } = useRuntimeConfig().public
  const t = useDictionary()
  const locale = useLocale()
  const alternates = usePageAlternates()
  const isMultilingual = locale.locales.length > 1
  const localize = (path: string, code = locale.locale) =>
    localizePath(path, code, locale.defaultLocale)
  const absolute = (path: string) => new URL(path, siteUrl).href

  const adminTitle = computed(() => toValue(input.adminTitle) ?? '')
  const title = computed(() => adminTitle.value || toValue(input.title))
  const canonical = computed(() =>
    absolute(localize(toValue(input.canonicalPath) ?? pagePath.value)),
  )
  const image = computed(() => toValue(input.image) ?? defaultImage.value)
  const prevHref = computed(() => toValue(input.pagination)?.prev)
  const nextHref = computed(() => toValue(input.pagination)?.next)
  const breadcrumb = computed(() =>
    buildBreadcrumb(
      pagePath.value,
      labelNavigation(ALL_NAVIGATION, t),
      input.breadcrumbLabel,
      toValue(input.breadcrumbTrail),
    ).map((item) => ({ ...item, href: localize(item.href) })),
  )
  const jsonLd = computed(() => [
    ...(breadcrumb.value.length ? [toBreadcrumbJsonLd(breadcrumb.value, siteUrl)] : []),
    ...(toValue(input.jsonLd) ?? []),
  ])
  // `hreflang` de chaque langue où la page existe, plus `x-default` vers la langue par défaut
  const languageLinks = computed(() => {
    if (!isMultilingual) return []
    const links = alternates.value.map(({ locale: code, path }) => ({
      rel: 'alternate' as const,
      hreflang: code,
      href: absolute(localize(path, code)),
    }))
    const fallback = links.find((link) => link.hreflang === locale.defaultLocale)
    return fallback ? [...links, { ...fallback, hreflang: 'x-default' }] : links
  })

  // Titre saisi : le modèle « · nom du site » posé par l'identité est retiré
  useHead(() => (adminTitle.value ? { titleTemplate: null } : {}))
  useHead({
    link: () => [
      { rel: 'canonical', href: canonical.value },
      ...(prevHref.value ? [{ rel: 'prev' as const, href: absolute(prevHref.value) }] : []),
      ...(nextHref.value ? [{ rel: 'next' as const, href: absolute(nextHref.value) }] : []),
      ...languageLinks.value,
    ],
    script: () =>
      jsonLd.value.map((data, index) => ({
        key: `json-ld-${index}`,
        type: 'application/ld+json',
        innerHTML: JSON.stringify(data),
      })),
  })

  useSeoMeta({
    title: () => title.value,
    description: () => toValue(input.description),
    robots: () => (toValue(input.noindex) ? 'noindex, follow' : 'index, follow'),
    ogType: () => (toValue(input.publishedTime) ? 'article' : 'website'),
    articlePublishedTime: () => toValue(input.publishedTime),
    ogLocale: ogLocale(locale.locale),
    ogLocaleAlternate: () =>
      isMultilingual
        ? alternates.value
            .filter((alternate) => alternate.locale !== locale.locale)
            .map((alternate) => ogLocale(alternate.locale))
        : undefined,
    ogTitle: () => title.value,
    ogDescription: () => toValue(input.description),
    ogUrl: () => canonical.value,
    ogImage: () => absolute(image.value.path),
    ogImageWidth: () => image.value.width,
    ogImageHeight: () => image.value.height,
    ogImageAlt: () => image.value.alt,
    twitterCard: 'summary_large_image',
    twitterTitle: () => title.value,
    twitterDescription: () => toValue(input.description),
    twitterImage: () => absolute(image.value.path),
  })
}
