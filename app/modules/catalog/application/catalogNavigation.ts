import { productHref } from '@/modules/catalog/domain/catalog'
import {
  categoryAlternates,
  categoryTrail,
  listCategoryLinks,
  resolveCategoryPath,
  slugsFromPath,
  toCategoryMenu,
} from '@/modules/catalog/domain/categoryPath'

import type { Catalog } from '@/modules/catalog/domain/catalog'
import type { CatalogRepository } from '@/modules/catalog/infrastructure/catalogRepository'
import type { LanguageAlternate } from '@/shared/i18n'

export const categoryMenuFor = (tree: Catalog.Category[]) => toCategoryMenu(tree)

export const catalogLinksFor = (tree: Catalog.Category[]) => listCategoryLinks(tree)

/**
 * Catégories pour le sitemap, lues dans l'arbre de la langue par défaut : chacune dans chaque langue
 * où elle existe, sa seule adresse sur un site monolingue.
 */
export const fetchCatalogAlternates = async (
  repository: CatalogRepository,
  defaultLocale: string,
): Promise<LanguageAlternate[][]> => {
  const tree = await repository.findCategoryTree()
  return listCategoryLinks(tree).map(({ href }) => {
    const alternates = categoryAlternates(tree, slugsFromPath(href) ?? [])
    return alternates.length > 0 ? alternates : [{ locale: defaultLocale, path: href }]
  })
}

/** Fiches produit d'une langue pour le sitemap, par identifiant ; aucune si l'API ne répond pas. */
export const fetchProductEntries = async (repository: CatalogRepository, locale: string) => ({
  locale,
  entries: (await repository.findAllProductEntries().catch(() => [])).map(({ id, slug }) => ({
    key: id,
    path: productHref(slug),
  })),
})

/** Piste du fil d'Ariane d'une URL du catalogue, ou null hors du catalogue ou pour un slug inconnu. */
export const catalogTrailFor = (tree: Catalog.Category[], path: string) => {
  const slugs = slugsFromPath(path)
  const categoryPath = slugs && resolveCategoryPath(tree, slugs)
  return categoryPath ? categoryTrail(categoryPath) : null
}
