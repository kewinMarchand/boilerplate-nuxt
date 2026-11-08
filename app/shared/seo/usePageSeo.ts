import { computed, toValue } from 'vue'
import { useHead, useRoute, useRuntimeConfig, useSeoMeta, useState } from '#imports'

import { SITE } from '@/shared/config'

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
  description: MaybeRefOrGetter<string>
  image?: MaybeRefOrGetter<SeoImage | undefined>
  noindex?: MaybeRefOrGetter<boolean>
  canonicalPath?: MaybeRefOrGetter<string>
  breadcrumbLabel?: string
  breadcrumbTrail?: MaybeRefOrGetter<Breadcrumb.Item[] | null>
  jsonLd?: MaybeRefOrGetter<Record<string, unknown>[]>
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
  const route = useRoute()
  const defaultImage = useDefaultSeoImage()
  const { siteUrl } = useRuntimeConfig().public
  const absolute = (path: string) => new URL(path, siteUrl).href

  const canonical = computed(() => absolute(toValue(input.canonicalPath) ?? route.path))
  const image = computed(() => toValue(input.image) ?? defaultImage.value)
  const prevHref = computed(() => toValue(input.pagination)?.prev)
  const nextHref = computed(() => toValue(input.pagination)?.next)
  const breadcrumb = computed(() =>
    buildBreadcrumb(route.path, input.breadcrumbLabel, toValue(input.breadcrumbTrail)),
  )
  const jsonLd = computed(() => [
    ...(breadcrumb.value.length ? [toBreadcrumbJsonLd(breadcrumb.value, siteUrl)] : []),
    ...(toValue(input.jsonLd) ?? []),
  ])

  useHead({
    link: () => [
      { rel: 'canonical', href: canonical.value },
      ...(prevHref.value ? [{ rel: 'prev' as const, href: absolute(prevHref.value) }] : []),
      ...(nextHref.value ? [{ rel: 'next' as const, href: absolute(nextHref.value) }] : []),
    ],
    script: () =>
      jsonLd.value.map((data, index) => ({
        key: `json-ld-${index}`,
        type: 'application/ld+json',
        innerHTML: JSON.stringify(data),
      })),
  })

  useSeoMeta({
    title: () => toValue(input.title),
    description: () => toValue(input.description),
    robots: () => (toValue(input.noindex) ? 'noindex, follow' : 'index, follow'),
    ogType: () => (toValue(input.publishedTime) ? 'article' : 'website'),
    articlePublishedTime: () => toValue(input.publishedTime),
    ogLocale: SITE.locale,
    ogTitle: () => toValue(input.title),
    ogDescription: () => toValue(input.description),
    ogUrl: () => canonical.value,
    ogImage: () => absolute(image.value.path),
    ogImageWidth: () => image.value.width,
    ogImageHeight: () => image.value.height,
    ogImageAlt: () => image.value.alt,
    twitterCard: 'summary_large_image',
    twitterTitle: () => toValue(input.title),
    twitterDescription: () => toValue(input.description),
    twitterImage: () => absolute(image.value.path),
  })
}
