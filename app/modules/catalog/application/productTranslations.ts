import type { Catalog } from '../domain/catalog'
import type { CatalogRepository } from '../infrastructure/catalogRepository'

/**
 * Slug et nom de la fiche dans chaque langue du site (panier affiché dans une autre langue que celle
 * de l'ajout) ; aucun sur un site monolingue. Une langue que l'API ne sert pas est omise.
 */
export const loadProductTranslations = async (
  repository: CatalogRepository,
  product: Catalog.ProductDetail,
  locale: string,
): Promise<Catalog.ProductTranslation[]> => {
  const translations = await Promise.all(
    product.alternates.map(async (alternate) => {
      if (alternate.locale === locale) return { locale, slug: product.slug, name: product.name }
      const translated = await repository
        .findProduct(alternate.slug, alternate.locale)
        .catch(() => null)
      return (
        translated && { locale: alternate.locale, slug: translated.slug, name: translated.name }
      )
    }),
  )
  return translations.filter((translation) => translation !== null)
}
