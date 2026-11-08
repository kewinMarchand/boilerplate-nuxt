import { useQuery } from '@tanstack/vue-query'
import { computed, onServerPrefetch, toValue } from 'vue'

import { ArticlesLoadError } from '@/modules/blog/infrastructure/ArticlesLoadError'
import { useArticleRepository } from '@/modules/blog/infrastructure/useArticleRepository'

import type { MaybeRefOrGetter } from 'vue'

export const LATEST_ARTICLES_QUERY_KEY = ['articles', 'latest'] as const

/** `section` : slug de la rubrique filtrée, tous les articles sans elle. */
export const useLatestArticles = (section?: MaybeRefOrGetter<string | undefined>) => {
  const repository = useArticleRepository()
  const query = useQuery({
    queryKey: [...LATEST_ARTICLES_QUERY_KEY, computed(() => toValue(section) ?? null)],
    queryFn: async () => {
      try {
        return await repository.findLatest(toValue(section))
      } catch (error) {
        console.error(error)
        throw new ArticlesLoadError({ cause: error })
      }
    },
  })
  onServerPrefetch(() => query.suspense())
  return query
}
