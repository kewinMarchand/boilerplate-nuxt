import { useQuery } from '@tanstack/vue-query'

import { useSlideRepository } from '@/modules/content/infrastructure/slideRepository'
import { SlidesLoadError } from '@/modules/content/infrastructure/SlidesLoadError'

/**
 * À attendre dans le `setup` : l'attente remplace `onServerPrefetch`, qui ne crée une frontière
 * asynchrone que côté serveur et décalerait les `useId` du carrousel (`aria-controls` cassés).
 */
export const useSlides = async () => {
  const repository = useSlideRepository()
  const query = useQuery({
    queryKey: ['slides'],
    queryFn: async () => {
      try {
        return await repository.findAll()
      } catch (error) {
        console.error(error)
        throw new SlidesLoadError({ cause: error })
      }
    },
  })
  await (import.meta.server ? query.suspense() : Promise.resolve())
  return query
}
