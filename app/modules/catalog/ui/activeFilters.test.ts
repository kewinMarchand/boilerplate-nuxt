import { fr } from '@/shared/i18n/dictionaries/fr'

import { DEFAULT_QUERY } from '../domain/catalogQuery'
import { describeActiveFilters } from './activeFilters'

describe('describeActiveFilters', () => {
  it('décrit chaque filtre avec son libellé et la requête qui le retire, page remise à 1', () => {
    const query = { ...DEFAULT_QUERY, exposures: ['mi-ombre' as const], inStock: true, page: 2 }

    expect(describeActiveFilters(query, [], fr.catalog)).toEqual([
      { id: 'exposition-mi-ombre', label: 'Mi-ombre', query: { ...query, exposures: [], page: 1 } },
      { id: 'en-stock', label: 'En stock', query: { ...query, inStock: false, page: 1 } },
    ])
  })

  it('nomme une valeur d’attribut par les libellés de sa facette', () => {
    const query = { ...DEFAULT_QUERY, attributes: { feuillage: ['caduc', 'persistant'] } }
    const facets = [
      {
        code: 'feuillage',
        label: 'Feuillage',
        values: [{ value: 'caduc', label: 'Caduc', count: 2 }],
      },
    ]

    expect(describeActiveFilters(query, facets, fr.catalog)).toEqual([
      {
        id: 'attr-feuillage-caduc',
        label: 'Feuillage : Caduc',
        query: { ...query, attributes: { feuillage: ['persistant'] }, page: 1 },
      },
      {
        id: 'attr-feuillage-persistant',
        label: 'Feuillage : persistant',
        query: { ...query, attributes: { feuillage: ['caduc'] }, page: 1 },
      },
    ])
  })
})
