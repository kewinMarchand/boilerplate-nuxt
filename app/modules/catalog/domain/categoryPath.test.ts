import {
  categoryAlternates,
  categoryHref,
  categoryTrail,
  listCategoryLinks,
  resolveCategoryPath,
  slugsFromPath,
  toCategoryMenu,
} from './categoryPath'

import type { Catalog } from './catalog'

const node = (slug: string, children: Catalog.Category[] = []): Catalog.Category => ({
  slug,
  label: slug.toUpperCase(),
  children,
  alternates: [],
})

const TREE = [
  node('a', [node('a1', [node('a1x', [node('a1x9')]), node('a1y')]), node('a2')]),
  node('b'),
]

describe('chemin de catégorie', () => {
  it('lit les slugs d’un chemin du catalogue, et rien hors du catalogue', () => {
    expect(slugsFromPath('/catalogue')).toEqual([])
    expect(slugsFromPath('/catalogue/a/a1/')).toEqual(['a', 'a1'])
    expect(slugsFromPath('/contact')).toBeNull()
    expect(slugsFromPath('/catalogues')).toBeNull()
  })

  it('construit l’URL d’une catégorie', () => {
    expect(categoryHref([])).toBe('/catalogue')
    expect(categoryHref(['a', 'a1'])).toBe('/catalogue/a/a1')
  })

  it('résout un chemin connu en chaîne de liens', () => {
    expect(resolveCategoryPath(TREE, ['a', 'a1'])).toEqual([
      { slug: 'a', label: 'A', href: '/catalogue/a' },
      { slug: 'a1', label: 'A1', href: '/catalogue/a/a1' },
    ])
    expect(resolveCategoryPath(TREE, [])).toEqual([])
  })

  it('rejette un slug inconnu ou un chemin trop profond', () => {
    expect(resolveCategoryPath(TREE, ['a', 'zz'])).toBeNull()
    expect(resolveCategoryPath(TREE, ['a', 'a1', 'a1x', 'a1x9'])).toBeNull()
  })

  it('donne la piste du fil d’Ariane depuis la racine du catalogue', () => {
    const path = resolveCategoryPath(TREE, ['a', 'a1']) ?? []
    expect(categoryTrail(path)).toEqual([
      { label: 'Catalogue', href: '/catalogue' },
      { label: 'A', href: '/catalogue/a' },
      { label: 'A1', href: '/catalogue/a/a1' },
    ])
  })

  it('liste les liens de toutes les catégories et construit le menu', () => {
    expect(listCategoryLinks([node('a', [node('a1')]), node('b')])).toEqual([
      { href: '/catalogue/a', label: 'A' },
      { href: '/catalogue/a/a1', label: 'A1' },
      { href: '/catalogue/b', label: 'B' },
    ])
    expect(toCategoryMenu([node('a', [node('a1')])])).toEqual({
      id: 'catalogue',
      label: 'Catalogue',
      href: '/catalogue',
      children: [
        {
          id: 'a',
          label: 'A',
          href: '/catalogue/a',
          children: [{ id: 'a1', label: 'A1', href: '/catalogue/a/a1', children: [] }],
        },
      ],
    })
  })
})

describe('categoryAlternates', () => {
  const translated = (fr: string, en: string, children: Catalog.Category[] = []) => ({
    slug: fr,
    label: fr,
    children,
    alternates: [
      { locale: 'fr', slug: fr },
      { locale: 'en', slug: en },
    ],
  })
  const tree = [
    translated('plantes-interieur', 'indoor-plants', [translated('feuillages', 'foliage-plants')]),
  ]

  it('construit le chemin de la catégorie dans chaque langue', () => {
    expect(categoryAlternates(tree, ['plantes-interieur', 'feuillages'])).toEqual([
      { locale: 'fr', path: '/catalogue/plantes-interieur/feuillages' },
      { locale: 'en', path: '/catalogue/indoor-plants/foliage-plants' },
    ])
  })

  it('n’en donne aucune pour un chemin inconnu ou un site monolingue', () => {
    expect(categoryAlternates(tree, ['inconnue'])).toEqual([])
    expect(categoryAlternates(TREE, ['a', 'a1'])).toEqual([])
  })
})
