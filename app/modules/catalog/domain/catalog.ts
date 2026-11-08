import type { Price } from './price'
import type { ResponsiveImage } from '@/shared/ui/kit'

export const PAGE_SIZE = 12
/** Plus grande page acceptée par l'API. */
export const MAX_PAGE_SIZE = 48

export const productHref = (slug: string) => `/produit/${slug}`

export declare namespace Catalog {
  type Exposure = 'soleil' | 'mi-ombre' | 'ombre'
  type Size = 'S' | 'M' | 'L'
  type Sort = 'pertinence' | 'prix-asc' | 'prix-desc' | 'nom'
  type View = 'grille' | 'liste'

  interface Category {
    slug: string
    label: string
    children: Category[]
  }

  interface CategoryLink {
    slug: string
    label: string
    href: string
  }

  /** Chaîne des catégories de la racine à la catégorie courante, validée contre l'arbre. */
  type CategoryPath = CategoryLink[]

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
  }

  /** Fiche : le produit, sa description et le chemin de sa catégorie, de la racine à elle (fil d'Ariane). */
  interface ProductDetail extends Product {
    categoryPath: CategoryPath
    /** Paragraphes de la description, vide si l'admin n'en a pas écrit. */
    description: string[]
  }

  interface Query {
    exposures: Exposure[]
    sizes: Size[]
    priceMin: number | null
    priceMax: number | null
    inStock: boolean
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

  interface Facet {
    exposures: FacetValue<Exposure>[]
    sizes: FacetValue<Size>[]
    categories: CategoryFacet[]
  }

  interface Page {
    items: Product[]
    total: number
    page: number
    pageCount: number
    facets: Facet
  }
}
