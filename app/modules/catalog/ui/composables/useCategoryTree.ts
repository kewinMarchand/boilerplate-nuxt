import { useQuery } from '@tanstack/vue-query'
import { computed } from 'vue'

import { categoryAlternates, slugsFromPath } from '@/modules/catalog/domain/categoryPath'
import {
  catalogLinksFor,
  catalogTrailFor,
  categoryMenuFor,
} from '@/modules/catalog/application/catalogNavigation'
import { useCatalogUseCases } from '@/modules/catalog/application/useCatalogUseCases'

export const CATEGORY_TREE_QUERY_KEY = ['catalog', 'categories'] as const

/** Arbre des catégories, lu une fois par requête serveur puis réhydraté dans le navigateur. */
export const useCategoryTree = () => {
  const { loadCategoryTree } = useCatalogUseCases()
  return useQuery({ queryKey: CATEGORY_TREE_QUERY_KEY, queryFn: loadCategoryTree })
}

/**
 * Menu, liens et fil d'Ariane du catalogue. API indisponible : menu vide, la page reste servie.
 * À attendre dans le `setup` : le serveur attend l'arbre, le navigateur le trouve réhydraté. Pas
 * d'`onServerPrefetch`, que Nuxt retire du build client : la frontière asynchrone n'existerait
 * que côté serveur et décalerait les `useId` de toute la page (layout, routage racine).
 */
export const useCatalogNavigation = async () => {
  const query = useCategoryTree()
  await (import.meta.server ? query.suspense() : Promise.resolve())
  const { data } = query
  const tree = computed(() => data.value ?? [])
  return {
    categoryMenu: computed(() => categoryMenuFor(tree.value)),
    catalogLinks: computed(() => catalogLinksFor(tree.value)),
    trailFor: (path: string) => catalogTrailFor(tree.value, path),
    /** Une catégorie (chemin sans préfixe de langue) dans chaque langue où elle existe. */
    alternatesFor: (path: string) => categoryAlternates(tree.value, slugsFromPath(path) ?? []),
  }
}
