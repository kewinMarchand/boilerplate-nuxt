import { useQuery } from '@tanstack/vue-query'
import { computed, onServerPrefetch, toValue, watch } from 'vue'
import { createError, showError } from '#imports'

import { articleAlternates } from '@/modules/blog/domain/article'
import { ArticleLoadError } from '@/modules/blog/infrastructure/ArticleLoadError'
import { useArticleRepository } from '@/modules/blog/infrastructure/useArticleRepository'

import type { MaybeRefOrGetter } from 'vue'

const NOT_FOUND = { statusCode: 404, fatal: true }

/** Requête d'un article, partagée par la page et le sélecteur de langue ; inactive sans slug. */
const useArticleQuery = (slug: MaybeRefOrGetter<string | undefined>) => {
  const repository = useArticleRepository()
  return useQuery({
    queryKey: ['article', computed(() => toValue(slug))],
    queryFn: async () => {
      try {
        return await repository.findBySlug(toValue(slug) ?? '')
      } catch (error) {
        console.error(error)
        throw new ArticleLoadError({ cause: error })
      }
    },
    enabled: () => toValue(slug) !== undefined,
  })
}

/** Fiche d'un article ; slug inconnu de l'API : 404, au rendu serveur comme dans le navigateur. */
export const useArticle = (slug: string) => {
  const query = useArticleQuery(slug)
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

/**
 * L'article `slug` dans chaque langue (sélecteur, `hreflang`), par la même requête que la page ;
 * aucune hors d'un article, pour un article inconnu ou une API en erreur. À attendre dans le `setup`.
 */
export const useArticleAlternates = async (slug: MaybeRefOrGetter<string | undefined>) => {
  const query = useArticleQuery(slug)
  // Attente des deux côtés : une frontière asynchrone serveur seulement décalerait les `useId`
  await (import.meta.server && toValue(slug) !== undefined
    ? query.suspense().catch(() => null)
    : Promise.resolve())
  return computed(() => (query.data.value ? articleAlternates(query.data.value) : []))
}
