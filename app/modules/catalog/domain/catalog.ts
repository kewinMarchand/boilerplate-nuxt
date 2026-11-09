import type { Price } from './price'
import type { LanguageAlternate } from '@/shared/i18n'
import type { ResponsiveImage } from '@/shared/ui/kit'

export const PAGE_SIZE = 12
/** Plus grande page acceptée par l'API. */
export const MAX_PAGE_SIZE = 48
/** Produits du carrousel « Produits similaires » de la fiche. */
export const SIMILAR_LIMIT = 8

export const productHref = (slug: string) => `/produit/${slug}`

/** La fiche dans chaque langue où le produit a un slug (`alternates` de l'API). */
export const productAlternates = (product: Catalog.ProductDetail): LanguageAlternate[] =>
  product.alternates.map(({ locale, slug }) => ({ locale, path: productHref(slug) }))

export declare namespace Catalog {
  type Exposure = 'soleil' | 'mi-ombre' | 'ombre'
  type Size = 'S' | 'M' | 'L'
  type Sort = 'pertinence' | 'prix-asc' | 'prix-desc' | 'nom'
  type View = 'grille' | 'liste'

  /** Slug d'un élément dans une langue activée (`alternates` de l'API, vide sur un site monolingue). */
  interface Alternate {
    locale: string
    slug: string
  }

  interface Category {
    slug: string
    label: string
    children: Category[]
    alternates: Alternate[]
  }

  interface CategoryLink {
    slug: string
    label: string
    href: string
  }

  /** Chaîne des catégories de la racine à la catégorie courante, validée contre l'arbre. */
  type CategoryPath = CategoryLink[]

  /** Attribut configurable dans l'admin, renseigné sur le produit : `value` est le libellé affiché. */
  interface ProductAttribute {
    code: string
    label: string
    value: string
    unit: string | null
  }

  interface Product {
    id: string
    slug: string
    name: string
    categorySlug: string
    price: Price
    exposure: Exposure
    size: Size
    inStock: boolean
    image: ResponsiveImage | null
    attributes: ProductAttribute[]
  }

  /** Slug et nom d'un produit dans une langue du site. */
  interface ProductTranslation {
    locale: string
    slug: string
    name: string
  }

  /** Fiche : le produit, sa description et le chemin de sa catégorie, de la racine à elle (fil d'Ariane). */
  interface ProductDetail extends Product {
    categoryPath: CategoryPath
    /** Paragraphes de la description, vide si l'admin n'en a pas écrit. */
    description: string[]
    /** Images supplémentaires, dans l'ordre, vide si aucune. */
    gallery: ResponsiveImage[]
    alternates: Alternate[]
    /** Vides si non saisis : la fiche garde son titre et sa description calculés. */
    metaTitle: string
    metaDescription: string
  }

  interface Query {
    exposures: Exposure[]
    sizes: Size[]
    priceMin: number | null
    priceMax: number | null
    inStock: boolean
    /** Valeurs cochées par code d'attribut. */
    attributes: Record<string, string[]>
    sort: Sort
    view: View
    page: number
  }

  interface FacetValue<TValue extends string> {
    value: TValue
    count: number
  }

  interface CategoryFacet {
    slug: string
    label: string
    href: string
    count: number
  }

  interface AttributeFacet {
    code: string
    label: string
    values: (FacetValue<string> & { label: string })[]
  }

  interface Facet {
    exposures: FacetValue<Exposure>[]
    sizes: FacetValue<Size>[]
    categories: CategoryFacet[]
    attributes: AttributeFacet[]
  }

  interface Page {
    items: Product[]
    total: number
    page: number
    pageCount: number
    facets: Facet
  }
}
