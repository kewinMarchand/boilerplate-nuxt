import { DEFAULT_QUERY } from '../domain/catalogQuery'
import { CatalogLoadError } from './CatalogLoadError'
import { isBeyondLastPage, loadCatalogPage, resolveCatalogCategory } from './catalogPage'

import type { Catalog } from '../domain/catalog'
import type { CatalogRepository } from '../infrastructure/catalogRepository'

const TREE: Catalog.Category[] = [
  {
    slug: 'plantes-interieur',
    label: 'Plantes d’intérieur',
    children: [{ slug: 'feuillages', label: 'Feuillages', children: [] }],
  },
]

const PAGE: Catalog.Page = {
  items: [],
  total: 0,
  page: 1,
  pageCount: 1,
  facets: { exposures: [], sizes: [], categories: [] },
}

const repository = (findCatalogPage: CatalogRepository['findCatalogPage']): CatalogRepository => ({
  findCategoryTree: async () => TREE,
  findCatalogPage,
  findProduct: async () => null,
  findFeaturedProducts: async () => [],
  findSimilarProducts: async () => [],
  findAllProductSlugs: async () => [],
})

describe('resolveCatalogCategory', () => {
  it('résout une catégorie connue en chemin de catégories', () => {
    const resolution = resolveCatalogCategory(TREE, ['plantes-interieur', 'feuillages'])

    expect(resolution.status).toBe('ok')
    if (resolution.status !== 'ok') throw new Error('chemin attendu')
    expect(resolution.path.map((link) => link.slug)).toEqual(['plantes-interieur', 'feuillages'])
  })

  it('déclare introuvables une catégorie inconnue et un chemin trop profond', () => {
    expect(resolveCatalogCategory(TREE, ['inconnue'])).toEqual({ status: 'not-found' })
    expect(resolveCatalogCategory(TREE, ['a', 'b', 'c', 'd'])).toEqual({ status: 'not-found' })
  })
})

describe('loadCatalogPage', () => {
  it('renvoie la page de résultats du dépôt', async () => {
    const findCatalogPage = vi.fn(async () => PAGE)

    expect(await loadCatalogPage(repository(findCatalogPage), ['feuillages'], DEFAULT_QUERY)).toBe(
      PAGE,
    )
    expect(findCatalogPage).toHaveBeenCalledWith(['feuillages'], DEFAULT_QUERY)
  })

  it('traduit un échec du dépôt en erreur de chargement qui garde la cause', async () => {
    const failure = new Error('panne')
    vi.spyOn(console, 'error').mockImplementationOnce(() => {})

    const error = await loadCatalogPage(
      repository(async () => {
        throw failure
      }),
      [],
      DEFAULT_QUERY,
    ).catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(CatalogLoadError)
    expect(error).toMatchObject({
      message: 'Impossible de charger les produits pour le moment.',
      cause: failure,
    })
  })
})

describe('isBeyondLastPage', () => {
  it('déclare introuvable une page au-delà de la dernière, pas la dernière', () => {
    const page = { ...PAGE, pageCount: 2 }
    expect(isBeyondLastPage(page, { ...DEFAULT_QUERY, page: 3 })).toBe(true)
    expect(isBeyondLastPage(page, { ...DEFAULT_QUERY, page: 2 })).toBe(false)
  })
})
