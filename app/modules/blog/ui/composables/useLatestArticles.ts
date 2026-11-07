import { useQuery } from '@tanstack/vue-query'
import { onServerPrefetch } from 'vue'

import { ArticlesLoadError } from '@/modules/blog/infrastructure/ArticlesLoadError'
import { useArticleRepository } from '@/modules/blog/infrastructure/useArticleRepository'

export const LATEST_ARTICLES_QUERY_KEY = ['articles', 'latest'] as const

export const useLatestArticles = () => {
  const repository = useArticleRepository()
  const query = useQuery({
    queryKey: LATEST_ARTICLES_QUERY_KEY,
    queryFn: async () => {
      try {
        return await repository.findLatest()
      } catch (error) {
        console.error(error)
        throw new ArticlesLoadError({ cause: error })
      }
    },
  })
  onServerPrefetch(() => query.suspense())
  return query
}
