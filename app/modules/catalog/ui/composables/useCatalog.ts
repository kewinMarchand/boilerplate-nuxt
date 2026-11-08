import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import { computed, onServerPrefetch, watch } from 'vue'
import { createError, showError, useRoute, useRouter } from '#imports'

import {
  parseCatalogQuery,
  serializeCatalogQuery,
  withoutPrices,
} from '@/modules/catalog/domain/catalogQuery'
import { isBeyondLastPage, resolveCatalogCategory } from '@/modules/catalog/application/catalogPage'
import { useCatalogUseCases } from '@/modules/catalog/application/useCatalogUseCases'

import { useCategoryTree } from './useCategoryTree'

import type { Catalog } from '@/modules/catalog/domain/catalog'

const NOT_FOUND = { statusCode: 404, fatal: true }

const toSlugs = (param: string | string[] | undefined) =>
  (Array.isArray(param) ? param : param ? [param] : []).filter(Boolean)

export const useCatalog = (salesEnabled: boolean) => {
  const route = useRoute()
  const router = useRouter()

  const { loadCatalogPage } = useCatalogUseCases()
  const tree = useCategoryTree()

  const slugs = computed(() => toSlugs(route.params.slug))
  // Arbre illisible (API en erreur) : pas de 404, la page affiche l'erreur du chargement.
  const resolution = computed(() =>
    tree.data.value ? resolveCatalogCategory(tree.data.value, slugs.value) : null,
  )
  const categoryPath = computed(() =>
    resolution.value?.status === 'ok' ? resolution.value.path : null,
  )
  onServerPrefetch(async () => {
    await tree.suspense()
    if (resolution.value?.status === 'not-found') throw createError(NOT_FOUND)
  })
  watch(
    resolution,
    (next) => {
      if (import.meta.client && next?.status === 'not-found') showError(NOT_FOUND)
    },
    { immediate: true },
  )

  const query = computed(() => {
    const parsed = parseCatalogQuery(route.query)
    return salesEnabled ? parsed : withoutPrices(parsed)
  })

  const catalog = useQuery({
    queryKey: ['catalog', slugs, query],
    queryFn: () => loadCatalogPage(slugs.value, query.value),
    placeholderData: keepPreviousData,
  })
  // Données affichées pendant le chargement (keepPreviousData) : elles décrivent l'URL précédente
  const beyondLastPage = computed(
    () =>
      !!catalog.data.value &&
      !catalog.isPlaceholderData.value &&
      isBeyondLastPage(catalog.data.value, query.value),
  )
  onServerPrefetch(async () => {
    await catalog.suspense()
    if (beyondLastPage.value) throw createError(NOT_FOUND)
  })
  watch(
    beyondLastPage,
    (beyond) => {
      if (import.meta.client && beyond) showError(NOT_FOUND)
    },
    { immediate: true },
  )

  const hrefFor = (next: Catalog.Query) =>
    router.resolve({ path: route.path, query: serializeCatalogQuery(next) }).fullPath

  const navigate = (next: Catalog.Query) =>
    router.push({ path: route.path, query: serializeCatalogQuery(next) })

  return { slugs, categoryPath, query, catalog, hrefFor, navigate }
}
