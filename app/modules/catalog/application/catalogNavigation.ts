import { productHref } from '@/modules/catalog/domain/catalog'
import {
  categoryTrail,
  listCategoryLinks,
  resolveCategoryPath,
  slugsFromPath,
  toCategoryMenu,
} from '@/modules/catalog/domain/categoryPath'

import type { Catalog } from '@/modules/catalog/domain/catalog'
import type { CatalogRepository } from '@/modules/catalog/infrastructure/catalogRepository'

export const categoryMenuFor = (tree: Catalog.Category[]) => toCategoryMenu(tree)

export const catalogLinksFor = (tree: Catalog.Category[]) => listCategoryLinks(tree)

/** Liens du catalogue pour le sitemap, lus dans l'arbre servi par l'API. */
export const fetchCatalogLinks = async (repository: CatalogRepository) =>
  listCategoryLinks(await repository.findCategoryTree())

/** Liens des fiches produit pour le sitemap ; aucun si l'API ne répond pas. */
export const fetchProductLinks = async (repository: CatalogRepository) =>
  (await repository.findAllProductSlugs().catch(() => [])).map((slug) => ({
    href: productHref(slug),
  }))

/** Piste du fil d'Ariane d'une URL du catalogue, ou null hors du catalogue ou pour un slug inconnu. */
export const catalogTrailFor = (tree: Catalog.Category[], path: string) => {
  const slugs = slugsFromPath(path)
  const categoryPath = slugs && resolveCategoryPath(tree, slugs)
  return categoryPath ? categoryTrail(categoryPath) : null
}
