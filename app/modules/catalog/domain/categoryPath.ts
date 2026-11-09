import { findCategoryChain } from './categoryTree'

import type { Catalog } from './catalog'
import type { NavigationItem, NavigationNode } from '@/shared/config'
import type { LanguageAlternate } from '@/shared/i18n'

export const CATALOG_ROOT = { href: '/catalogue', label: 'Catalogue' } as const
export const MAX_CATEGORY_DEPTH = 3

export const categoryHref = (slugs: string[]) =>
  slugs.length > 0 ? `${CATALOG_ROOT.href}/${slugs.join('/')}` : CATALOG_ROOT.href

/** Slugs d'un chemin d'URL du catalogue, ou null si le chemin est hors du catalogue. */
export const slugsFromPath = (path: string): string[] | null => {
  if (path !== CATALOG_ROOT.href && !path.startsWith(`${CATALOG_ROOT.href}/`)) return null
  return path.slice(CATALOG_ROOT.href.length).split('/').filter(Boolean)
}

/** Seul point de validation des slugs : profondeur et existence dans l'arbre. Null vaut 404. */
export const resolveCategoryPath = (
  tree: Catalog.Category[],
  slugs: string[],
): Catalog.CategoryPath | null => {
  if (slugs.length > MAX_CATEGORY_DEPTH) return null
  const chain = findCategoryChain(tree, slugs)
  return (
    chain?.map((category, index) => ({
      slug: category.slug,
      label: category.label,
      href: categoryHref(slugs.slice(0, index + 1)),
    })) ?? null
  )
}

/** Piste du fil d'Ariane, de la racine du catalogue à la catégorie courante. */
export const categoryTrail = (path: Catalog.CategoryPath): NavigationItem[] => [
  CATALOG_ROOT,
  ...path.map(({ label, href }) => ({ label, href })),
]

export const listCategoryLinks = (
  tree: Catalog.Category[],
  parents: string[] = [],
): NavigationItem[] =>
  tree.flatMap((category) => {
    const slugs = [...parents, category.slug]
    return [
      { href: categoryHref(slugs), label: category.label },
      ...listCategoryLinks(category.children, slugs),
    ]
  })

const toNavigationNodes = (tree: Catalog.Category[], parents: string[]): NavigationNode[] =>
  tree.map((category) => {
    const slugs = [...parents, category.slug]
    return {
      id: category.slug,
      label: category.label,
      href: categoryHref(slugs),
      children: toNavigationNodes(category.children, slugs),
    }
  })

export const toCategoryMenu = (tree: Catalog.Category[]): NavigationNode => ({
  id: 'catalogue',
  label: CATALOG_ROOT.label,
  href: CATALOG_ROOT.href,
  children: toNavigationNodes(tree, []),
})

/**
 * Une catégorie dans chaque langue où toute sa chaîne a un slug (`alternates` de chaque nœud) ;
 * aucune pour un chemin inconnu ou un site monolingue.
 */
export const categoryAlternates = (
  tree: Catalog.Category[],
  slugs: string[],
): LanguageAlternate[] => {
  const chain = findCategoryChain(tree, slugs)
  const [first] = chain ?? []
  if (!chain || !first) return []
  return first.alternates.flatMap(({ locale }) => {
    const localized = chain.map(
      (category) => category.alternates.find((alternate) => alternate.locale === locale)?.slug,
    )
    return localized.every((slug): slug is string => slug !== undefined)
      ? [{ locale, path: categoryHref(localized) }]
      : []
  })
}
