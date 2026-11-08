import { useQuery } from '@tanstack/vue-query'

import { useCatalogUseCases } from '@/modules/catalog/application/useCatalogUseCases'

/** À attendre dans le `setup`, comme `useFeaturedProducts` : un `onServerPrefetch` décalerait les `useId` du carrousel. */
export const useSimilarProducts = async (categorySlug: string, productSlug: string) => {
  const { loadSimilarProducts } = useCatalogUseCases()
  const query = useQuery({
    queryKey: ['similar-products', categorySlug, productSlug],
    queryFn: () => loadSimilarProducts(categorySlug, productSlug),
  })
  await (import.meta.server ? query.suspense() : Promise.resolve())
  return query
}
