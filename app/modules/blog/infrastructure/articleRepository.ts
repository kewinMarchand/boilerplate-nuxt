import { ApiError, createApiClient } from '@/shared/api/client'

import { toArticle, toArticleDetail, toArticleTerm } from './http/articleTranslation'

import type { Article } from '../domain/article'
import type { ApiClient } from '@/shared/api/client'

export const createArticleRepository = (api: ApiClient) => ({
  /** `section` : slug d'une rubrique, la liste entière sans lui. */
  findLatest: async (section?: string): Promise<Article.Entity[]> => {
    const { data, response } = await api.GET('/api/articles', {
      params: { query: section ? { section } : {} },
    })
    if (!data) throw new ApiError(response)
    return data.map(toArticle)
  },
  findSections: async (): Promise<Article.Term[]> => {
    const { data, response } = await api.GET('/api/article-sections')
    if (!data) throw new ApiError(response)
    return data.map(toArticleTerm)
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
export const serverArticleRepository = (
  apiUrl: string,
  scenario: string | null | undefined,
  locale: string,
) => createArticleRepository(createApiClient(apiUrl, scenario, locale))
