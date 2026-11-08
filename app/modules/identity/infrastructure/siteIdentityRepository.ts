import { ApiError, createApiClient } from '@/shared/api/client'

import { toPageMetas } from './http/pageMetaTranslation'
import { toSiteIdentity } from './http/siteIdentityTranslation'

import type { PageMeta } from '../domain/pageMeta'
import type { SiteIdentity } from '../domain/siteIdentity'
import type { ApiClient } from '@/shared/api/client'

export interface SiteIdentityRepository {
  find: () => Promise<SiteIdentity.Entity>
  findPageMetas: () => Promise<PageMeta.ByPage>
}

export const createSiteIdentityRepository = (api: ApiClient): SiteIdentityRepository => ({
  find: async () => {
    const { data, response } = await api.GET('/api/site-identity')
    if (!data) throw new ApiError(response)
    return toSiteIdentity(data)
  },
  findPageMetas: async () => {
    const { data, response } = await api.GET('/api/page-metas')
    if (!data) throw new ApiError(response)
    return toPageMetas(data)
  },
})

/** Dépôt d'une route serveur Nitro, hors application Vue. */
export const serverSiteIdentityRepository = (apiUrl: string, scenario?: string | null) =>
  createSiteIdentityRepository(createApiClient(apiUrl, scenario))
