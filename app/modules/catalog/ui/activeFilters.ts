import { withFilters } from '../domain/catalogQuery'
import { EXPOSURE_LABELS, SIZE_LABELS } from './labels'

import type { Catalog } from '../domain/catalog'

export interface ActiveFilter {
  id: string
  label: string
  query: Catalog.Query
}

const attributeLabel = (facets: Catalog.AttributeFacet[], code: string, value: string) => {
  const facet = facets.find((candidate) => candidate.code === code)
  const valueLabel = facet?.values.find((candidate) => candidate.value === value)?.label ?? value
  return facet ? `${facet.label} : ${valueLabel}` : valueLabel
}

export const describeActiveFilters = (
  query: Catalog.Query,
  attributeFacets: Catalog.AttributeFacet[],
): ActiveFilter[] => [
  ...query.exposures.map((value) => ({
    id: `exposition-${value}`,
    label: EXPOSURE_LABELS[value],
    query: withFilters(query, { exposures: query.exposures.filter((other) => other !== value) }),
  })),
  ...query.sizes.map((value) => ({
    id: `taille-${value}`,
    label: SIZE_LABELS[value],
    query: withFilters(query, { sizes: query.sizes.filter((other) => other !== value) }),
  })),
  ...Object.entries(query.attributes).flatMap(([code, values]) =>
    values.map((value) => ({
      id: `attr-${code}-${value}`,
      label: attributeLabel(attributeFacets, code, value),
      query: withFilters(query, {
        attributes: { ...query.attributes, [code]: values.filter((other) => other !== value) },
      }),
    })),
  ),
  ...(query.priceMin !== null
    ? [
        {
          id: 'prix-min',
          label: `Dès ${query.priceMin} €`,
          query: withFilters(query, { priceMin: null }),
        },
      ]
    : []),
  ...(query.priceMax !== null
    ? [
        {
          id: 'prix-max',
          label: `Jusqu’à ${query.priceMax} €`,
          query: withFilters(query, { priceMax: null }),
        },
      ]
    : []),
  ...(query.inStock
    ? [{ id: 'en-stock', label: 'En stock', query: withFilters(query, { inStock: false }) }]
    : []),
]
