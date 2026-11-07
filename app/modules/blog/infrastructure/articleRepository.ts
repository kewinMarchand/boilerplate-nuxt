import { ApiError, createApiClient } from '@/shared/api/client'

import { toArticle, toArticleDetail } from './http/articleTranslation'

import type { Article } from '../domain/article'
import type { ApiClient } from '@/shared/api/client'

export const createArticleRepository = (api: ApiClient) => ({
  findLatest: async (): Promise<Article.Entity[]> => {
    const { data, response } = await api.GET('/api/articles')
    if (!data) throw new ApiError(response)
    return data.map(toArticle)
  },
  /** `null` si l'API ne connaît pas l'article (404). */
  findBySlug: async (slug: string): Promise<Article.Detail | null> => {
    const { data, response } = await api.GET('/api/articles/{slug}', {
      params: { path: { slug } },
    })
    if (response.status === 404) return null
    if (!data) throw new ApiError(response)
    return toArticleDetail(data)
  },
})

/** Dépôt d'une route serveur Nitro, hors application Vue. */
export const serverArticleRepository = (apiUrl: string, scenario?: string | null) =>
  createArticleRepository(createApiClient(apiUrl, scenario))
