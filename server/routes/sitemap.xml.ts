import { LEGAL_NAVIGATION, MAIN_NAVIGATION } from '@/shared/config'
import { alternatesByKey, FALLBACK_LOCALE, localizePath } from '@/shared/i18n'

import type { LanguageAlternate } from '@/shared/i18n'

import { articleHref, serverArticleRepository } from '@/modules/blog/index.server'
import {
  CATALOG_ROOT,
  fetchCatalogAlternates,
  fetchProductEntries,
  serverCatalogRepository,
} from '@/modules/catalog/index.server'
import { serverSiteIdentityRepository } from '@/modules/identity/index.server'

/** Une entrée par adresse et par langue ; à plus d'une langue, chacune liste ses équivalents (`xhtml:link`). */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const apiUrl = config.apiUrl || config.public.apiUrl
  const scenario = getHeader(event, 'x-scenario') ?? (config.public.apiScenario || null)
  const { locales } = await serverSiteIdentityRepository(apiUrl, scenario)
    .find()
    .catch(() => ({ locales: [FALLBACK_LOCALE] }))
  const [defaultLocale = FALLBACK_LOCALE] = locales
  const [catalogAlternates, productEntries, articleEntries] = await Promise.all([
    fetchCatalogAlternates(serverCatalogRepository(apiUrl, scenario, defaultLocale), defaultLocale),
    Promise.all(
      locales.map((locale) =>
        fetchProductEntries(serverCatalogRepository(apiUrl, scenario, locale), locale),
      ),
    ),
    Promise.all(
      locales.map(async (locale) => ({
        locale,
        // API indisponible : le sitemap reste servi, sans les fiches
        entries: (
          await serverArticleRepository(apiUrl, scenario, locale)
            .findLatest()
            .catch(() => [])
        ).map((article) => ({ key: article.id, path: articleHref(article.slug) })),
      })),
    ),
  ])
  const everyLocale = (href: string) => locales.map((locale) => ({ locale, path: href }))
  const groups: LanguageAlternate[][] = [
    ...[...MAIN_NAVIGATION, CATALOG_ROOT].map(({ href }) => everyLocale(href)),
    ...catalogAlternates,
    ...alternatesByKey(productEntries),
    ...alternatesByKey(articleEntries),
    ...LEGAL_NAVIGATION.map(({ href }) => everyLocale(href)),
  ]
  const isMultilingual = locales.length > 1
  const url = ({ locale, path }: LanguageAlternate) =>
    new URL(localizePath(path, locale, defaultLocale), config.public.siteUrl).href
  const urls = groups
    .flatMap((alternates) =>
      alternates.map((alternate) => {
        const links = isMultilingual
          ? alternates.map(
              (item) =>
                `\n    <xhtml:link rel="alternate" hreflang="${item.locale}" href="${url(item)}"/>`,
            )
          : []
        return `  <url><loc>${url(alternate)}</loc>${links.join('')}${isMultilingual ? '\n  ' : ''}</url>`
      }),
    )
    .join('\n')
  const namespaces = isMultilingual ? ' xmlns:xhtml="http://www.w3.org/1999/xhtml"' : ''

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${namespaces}>\n${urls}\n</urlset>\n`
})
