import { useCatalogRepository } from '../infrastructure/useCatalogRepository'
import { loadCatalogPage } from './catalogPage'

import type { Catalog } from '../domain/catalog'

/** Cas d'utilisation branchés sur le dépôt de la requête en cours, à créer dans un `setup`. */
export const useCatalogUseCases = () => {
  const repository = useCatalogRepository()
  return {
    loadCategoryTree: () => repository.findCategoryTree(),
    loadCatalogPage: (slugs: string[], query: Catalog.Query) =>
      loadCatalogPage(repository, slugs, query),
    loadProduct: (slug: string) => repository.findProduct(slug),
    loadFeaturedProducts: () => repository.findFeaturedProducts(),
  }
}
