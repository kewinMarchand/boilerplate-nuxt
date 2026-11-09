import { useCatalogRepository } from '../infrastructure/useCatalogRepository'
import { loadCatalogPage } from './catalogPage'
import { loadProductTranslations } from './productTranslations'

import type { Catalog } from '../domain/catalog'

/** Cas d'utilisation branchés sur le dépôt de la requête en cours, à créer dans un `setup`. */
export const useCatalogUseCases = () => {
  const repository = useCatalogRepository()
  return {
    loadCategoryTree: () => repository.findCategoryTree(),
    loadCatalogPage: (slugs: string[], query: Catalog.Query) =>
      loadCatalogPage(repository, slugs, query),
    loadProduct: (slug: string) => repository.findProduct(slug),
    loadProductTranslations: (product: Catalog.ProductDetail, locale: string) =>
      loadProductTranslations(repository, product, locale),
    loadFeaturedProducts: () => repository.findFeaturedProducts(),
    /** Aucun produit si l'API ne répond pas : la fiche reste l'essentiel. */
    loadSimilarProducts: (categorySlug: string, excludedSlug: string) =>
      repository.findSimilarProducts(categorySlug, excludedSlug).catch((error: unknown) => {
        console.error(error)
        return []
      }),
  }
}
