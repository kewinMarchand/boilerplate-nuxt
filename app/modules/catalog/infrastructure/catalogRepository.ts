import { ApiError, createApiClient } from '@/shared/api/client'

import { MAX_PAGE_SIZE, SIMILAR_LIMIT } from '../domain/catalog'
import {
  toCatalogPage,
  toCategory,
  toFacetsQuery,
  toProduct,
  toProductDetail,
  toProductsQuery,
} from './http/catalogTranslation'

import type { Catalog } from '../domain/catalog'
import type { ApiClient } from '@/shared/api/client'

export interface CatalogRepository {
  findCategoryTree: () => Promise<Catalog.Category[]>
  findCatalogPage: (slugs: string[], query: Catalog.Query) => Promise<Catalog.Page>
  /** `null` si l'API ne connaît pas le produit (404). */
  /** `locale` : une autre langue que celle de la page (panier dans chaque langue). */
  findProduct: (slug: string, locale?: string) => Promise<Catalog.ProductDetail | null>
  findFeaturedProducts: () => Promise<Catalog.Product[]>
  /** Produits de la catégorie, sans celui affiché : le carrousel de la fiche. */
  findSimilarProducts: (categorySlug: string, excludedSlug: string) => Promise<Catalog.Product[]>
  /** Identifiant et slug de tous les produits, page après page jusqu'à une page incomplète (sitemap). */
  findAllProductEntries: () => Promise<{ id: string; slug: string }[]>
}

export const createCatalogRepository = (api: ApiClient): CatalogRepository => ({
  findCategoryTree: async () => {
    const { data, response } = await api.GET('/api/categories')
    if (!data) throw new ApiError(response)
    return data.map(toCategory)
  },
  findCatalogPage: async (slugs, query) => {
    const [products, facets] = await Promise.all([
      api.GET('/api/products', { params: { query: toProductsQuery(slugs, query) } }),
      api.GET('/api/product-facets', { params: { query: toFacetsQuery(slugs, query) } }),
    ])
    if (!products.data) throw new ApiError(products.response)
    if (!facets.data) throw new ApiError(facets.response)
    return toCatalogPage(products.data, facets.data, query.page, slugs)
  },
  findProduct: async (slug, locale) => {
    const { data, response } = await api.GET('/api/products/{slug}', {
      params: { path: { slug }, query: locale ? { locale } : {} },
    })
    if (response.status === 404) return null
    if (!data) throw new ApiError(response)
    return toProductDetail(data)
  },
  findFeaturedProducts: async () => {
    const { data, response } = await api.GET('/api/featured-products')
    if (!data) throw new ApiError(response)
    return data.map(toProduct)
  },
  findSimilarProducts: async (categorySlug, excludedSlug) => {
    const { data, response } = await api.GET('/api/products', {
      params: { query: { category: categorySlug, itemsPerPage: SIMILAR_LIMIT + 1 } },
    })
    if (!data) throw new ApiError(response)
    return data
      .map(toProduct)
      .filter((product) => product.slug !== excludedSlug)
      .slice(0, SIMILAR_LIMIT)
  },
  findAllProductEntries: async () => {
    const entries: { id: string; slug: string }[] = []
    for (let page = 1; ; page += 1) {
      const { data, response } = await api.GET('/api/products', {
        params: { query: { page, itemsPerPage: MAX_PAGE_SIZE } },
      })
      if (!data) throw new ApiError(response)
      entries.push(...data.map((item) => ({ id: String(item.id), slug: item.slug })))
      if (data.length < MAX_PAGE_SIZE) return entries
    }
  },
})

/** Dépôt d'une route serveur Nitro, hors application Vue. */
export const serverCatalogRepository = (
  apiUrl: string,
  scenario: string | null | undefined,
  locale: string,
) => createCatalogRepository(createApiClient(apiUrl, scenario, locale))
