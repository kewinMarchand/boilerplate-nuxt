import { useQuery } from '@tanstack/vue-query'
import { onServerPrefetch, watch } from 'vue'
import { createError, showError } from '#imports'

import { ArticleLoadError } from '@/modules/blog/infrastructure/ArticleLoadError'
import { useArticleRepository } from '@/modules/blog/infrastructure/useArticleRepository'

const NOT_FOUND = { statusCode: 404, fatal: true }

/** Fiche d'un article ; slug inconnu de l'API : 404, au rendu serveur comme dans le navigateur. */
export const useArticle = (slug: string) => {
  const repository = useArticleRepository()
  const query = useQuery({
    queryKey: ['article', slug],
    queryFn: async () => {
      try {
        return await repository.findBySlug(slug)
      } catch (error) {
        console.error(error)
        throw new ArticleLoadError({ cause: error })
      }
    },
  })
  onServerPrefetch(async () => {
    await query.suspense()
    if (query.data.value === null) throw createError(NOT_FOUND)
  })
  // Au rendu serveur, le watch immédiat ne voit que la donnée pas encore chargée : le 404 y part de onServerPrefetch
  watch(
    query.data,
    (article) => {
      if (article === null) showError(NOT_FOUND)
    },
    { immediate: true },
  )
  return query
}
