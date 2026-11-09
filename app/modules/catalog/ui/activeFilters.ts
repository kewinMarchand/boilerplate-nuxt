import { format } from '@/shared/i18n'

import { withFilters } from '../domain/catalogQuery'

import type { Catalog } from '../domain/catalog'
import type { Dictionary } from '@/shared/i18n'

export interface ActiveFilter {
  id: string
  label: string
  query: Catalog.Query
}

const attributeLabel = (
  facets: Catalog.AttributeFacet[],
  code: string,
  value: string,
  t: Dictionary['catalog'],
) => {
  const facet = facets.find((candidate) => candidate.code === code)
  const valueLabel = facet?.values.find((candidate) => candidate.value === value)?.label ?? value
  return facet
    ? format(t.attributeFilter, { attribute: facet.label, value: valueLabel })
    : valueLabel
}

/** Filtres actifs libellés dans la langue de la page (`t` : libellés du catalogue). */
export const describeActiveFilters = (
  query: Catalog.Query,
  attributeFacets: Catalog.AttributeFacet[],
  t: Dictionary['catalog'],
): ActiveFilter[] => [
  ...query.exposures.map((value) => ({
    id: `exposition-${value}`,
    label: t.exposures[value],
    query: withFilters(query, { exposures: query.exposures.filter((other) => other !== value) }),
  })),
  ...query.sizes.map((value) => ({
    id: `taille-${value}`,
    label: t.sizes[value],
    query: withFilters(query, { sizes: query.sizes.filter((other) => other !== value) }),
  })),
  ...Object.entries(query.attributes).flatMap(([code, values]) =>
    values.map((value) => ({
      id: `attr-${code}-${value}`,
      label: attributeLabel(attributeFacets, code, value, t),
      query: withFilters(query, {
        attributes: { ...query.attributes, [code]: values.filter((other) => other !== value) },
      }),
    })),
  ),
  ...(query.priceMin !== null
    ? [
        {
          id: 'prix-min',
          label: format(t.fromPrice, { euros: query.priceMin }),
          query: withFilters(query, { priceMin: null }),
        },
      ]
    : []),
  ...(query.priceMax !== null
    ? [
        {
          id: 'prix-max',
          label: format(t.upToPrice, { euros: query.priceMax }),
          query: withFilters(query, { priceMax: null }),
        },
      ]
    : []),
  ...(query.inStock
    ? [{ id: 'en-stock', label: t.inStock, query: withFilters(query, { inStock: false }) }]
    : []),
]
