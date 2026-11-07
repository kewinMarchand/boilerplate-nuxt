import { useQuery } from '@tanstack/vue-query'

import { FeaturedProductsLoadError } from '@/modules/catalog/application/FeaturedProductsLoadError'
import { useCatalogUseCases } from '@/modules/catalog/application/useCatalogUseCases'

/**
 * À attendre dans le `setup` : l'attente remplace `onServerPrefetch`, qui ne crée une frontière
 * asynchrone que côté serveur et décalerait les `useId` du carrousel (`aria-controls` cassés).
 */
export const useFeaturedProducts = async () => {
  const { loadFeaturedProducts } = useCatalogUseCases()
  const query = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      try {
        return await loadFeaturedProducts()
      } catch (error) {
        console.error(error)
        throw new FeaturedProductsLoadError({ cause: error })
      }
    },
  })
  await (import.meta.server ? query.suspense() : Promise.resolve())
  return query
}
