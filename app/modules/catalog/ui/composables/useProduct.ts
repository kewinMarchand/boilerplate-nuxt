import { useQuery } from '@tanstack/vue-query'
import { watch } from 'vue'
import { createError, showError } from '#imports'

import { ProductLoadError } from '@/modules/catalog/application/ProductLoadError'
import { useCatalogUseCases } from '@/modules/catalog/application/useCatalogUseCases'

const NOT_FOUND = { statusCode: 404, fatal: true }

/**
 * Fiche d'un produit ; slug inconnu de l'API : 404, au rendu serveur comme dans le navigateur.
 * À attendre dans le `setup` : un `onServerPrefetch` décalerait les `useId` du carrousel des produits similaires.
 */
export const useProduct = async (slug: string) => {
  const { loadProduct } = useCatalogUseCases()
  const query = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      try {
        return await loadProduct(slug)
      } catch (error) {
        console.error(error)
        throw new ProductLoadError({ cause: error })
      }
    },
  })
  // Au rendu serveur, le watch immédiat ne voit que la donnée pas encore chargée : le 404 y part de l'attente ci-dessous
  watch(
    query.data,
    (product) => {
      if (product === null) showError(NOT_FOUND)
    },
    { immediate: true },
  )
  if (import.meta.server) {
    await query.suspense()
    if (query.data.value === null) throw createError(NOT_FOUND)
  }
  return query
}
