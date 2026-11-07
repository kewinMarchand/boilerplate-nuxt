import { ApiError, createApiClient } from '@/shared/api/client'

import { MAX_PAGE_SIZE } from '../domain/catalog'
import {
  toCatalogPage,
  toCategory,
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
  findProduct: (slug: string) => Promise<Catalog.ProductDetail | null>
  findFeaturedProducts: () => Promise<Catalog.Product[]>
  /** Slugs de tous les produits, page après page (sitemap). */
  findAllProductSlugs: () => Promise<string[]>
}

export const createCatalogRepository = (api: ApiClient): CatalogRepository => ({
  findCategoryTree: async () => {
    const { data, response } = await api.GET('/api/categories')
    if (!data) throw new ApiError(response)
    return data.map(toCategory)
  },
  findCatalogPage: async (slugs, query) => {
    const { data, response } = await api.GET('/api/products', {
      params: { query: toProductsQuery(slugs, query) },
    })
    if (!data) throw new ApiError(response)
    return toCatalogPage(data, slugs)
  },
  findProduct: async (slug) => {
    const { data, response } = await api.GET('/api/products/{slug}', {
      params: { path: { slug } },
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
  findAllProductSlugs: async () => {
    const slugs: string[] = []
    for (let page = 1; ; page += 1) {
      const { data, response } = await api.GET('/api/products', {
        params: { query: { page, itemsPerPage: MAX_PAGE_SIZE } },
      })
      if (!data) throw new ApiError(response)
      slugs.push(...data.items.map((item) => item.slug))
      if (page >= data.totalPages) return slugs
    }
  },
})

/** Dépôt d'une route serveur Nitro, hors application Vue. */
export const serverCatalogRepository = (apiUrl: string, scenario?: string | null) =>
  createCatalogRepository(createApiClient(apiUrl, scenario))
