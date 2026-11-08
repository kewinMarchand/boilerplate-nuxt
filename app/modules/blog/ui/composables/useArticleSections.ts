import { useQuery } from '@tanstack/vue-query'
import { onServerPrefetch } from 'vue'

import { useArticleRepository } from '@/modules/blog/infrastructure/useArticleRepository'

/** Rubriques du filtre de /blog ; API en erreur : liste vide, le filtre disparaît et la liste reste servie. */
export const useArticleSections = () => {
  const repository = useArticleRepository()
  const query = useQuery({
    queryKey: ['article-sections'],
    queryFn: () =>
      repository.findSections().catch((error: unknown) => {
        console.error(error)
        return []
      }),
  })
  onServerPrefetch(() => query.suspense())
  return query
}
