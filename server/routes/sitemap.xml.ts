import { LEGAL_NAVIGATION, MAIN_NAVIGATION } from '@/shared/config'

import {
  CATALOG_ROOT,
  fetchCatalogLinks,
  serverCatalogRepository,
} from '@/modules/catalog/index.server'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const catalogLinks = await fetchCatalogLinks(
    serverCatalogRepository(config.apiUrl || config.public.apiUrl, getHeader(event, 'x-scenario')),
  )
  const pages = [...MAIN_NAVIGATION, CATALOG_ROOT, ...catalogLinks, ...LEGAL_NAVIGATION]
  const urls = pages
    .map(({ href }) => `  <url><loc>${new URL(href, config.public.siteUrl).href}</loc></url>`)
    .join('\n')

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
})
