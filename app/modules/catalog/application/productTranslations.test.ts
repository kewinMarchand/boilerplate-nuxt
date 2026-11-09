import { loadProductTranslations } from './productTranslations'

import type { Catalog } from '../domain/catalog'
import type { CatalogRepository } from '../infrastructure/catalogRepository'

const product = (alternates: Catalog.Alternate[]) =>
  ({ slug: 'monstera-deliciosa', name: 'Monstera deliciosa', alternates }) as Catalog.ProductDetail

const repository = (findProduct: CatalogRepository['findProduct']) =>
  ({ findProduct }) as CatalogRepository

describe('loadProductTranslations', () => {
  it('ne demande rien sur un site monolingue', async () => {
    const findProduct = vi.fn<CatalogRepository['findProduct']>()

    expect(await loadProductTranslations(repository(findProduct), product([]), 'fr')).toEqual([])
    expect(findProduct).not.toHaveBeenCalled()
  })

  it('lit le nom dans chaque autre langue et omet celle que l’API ne sert pas', async () => {
    const findProduct = vi.fn<CatalogRepository['findProduct']>(async (slug, locale) =>
      locale === 'en'
        ? ({ slug, name: 'Swiss cheese plant' } as Catalog.ProductDetail)
        : Promise.reject(new Error('API muette')),
    )

    expect(
      await loadProductTranslations(
        repository(findProduct),
        product([
          { locale: 'fr', slug: 'monstera-deliciosa' },
          { locale: 'en', slug: 'swiss-cheese-plant' },
          { locale: 'de', slug: 'fensterblatt' },
        ]),
        'fr',
      ),
    ).toEqual([
      { locale: 'fr', slug: 'monstera-deliciosa', name: 'Monstera deliciosa' },
      { locale: 'en', slug: 'swiss-cheese-plant', name: 'Swiss cheese plant' },
    ])
    expect(findProduct).toHaveBeenCalledWith('swiss-cheese-plant', 'en')
  })
})
