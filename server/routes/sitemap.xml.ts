import { LEGAL_NAVIGATION, MAIN_NAVIGATION } from '@/shared/config'

import { articleHref, serverArticleRepository } from '@/modules/blog/index.server'
import {
  CATALOG_ROOT,
  fetchCatalogLinks,
  fetchProductLinks,
  serverCatalogRepository,
} from '@/modules/catalog/index.server'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const apiUrl = config.apiUrl || config.public.apiUrl
  const scenario = getHeader(event, 'x-scenario')
  const catalog = serverCatalogRepository(apiUrl, scenario)
  const [catalogLinks, productLinks, articles] = await Promise.all([
    fetchCatalogLinks(catalog),
    fetchProductLinks(catalog),
    // API indisponible : le sitemap reste servi, sans les fiches
    serverArticleRepository(apiUrl, scenario)
      .findLatest()
      .catch(() => []),
  ])
  const articleLinks = articles.map((article) => ({ href: articleHref(article.slug) }))
  const pages = [
    ...MAIN_NAVIGATION,
    CATALOG_ROOT,
    ...catalogLinks,
    ...productLinks,
    ...articleLinks,
    ...LEGAL_NAVIGATION,
  ]
  const urls = pages
    .map(({ href }) => `  <url><loc>${new URL(href, config.public.siteUrl).href}</loc></url>`)
    .join('\n')

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
})
