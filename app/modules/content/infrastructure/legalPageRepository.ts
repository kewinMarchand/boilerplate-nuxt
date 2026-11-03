import { ApiError } from '@/shared/api/client'
import { useApiClient } from '@/shared/api/useApiClient'

import { toLegalPage } from './http/legalPageTranslation'

import type { LegalPage } from '@/modules/content/domain/legalPage'

/** Dépôt de la requête en cours, à créer dans un `setup`. */
export const useLegalPageRepository = () => {
  const api = useApiClient()
  return {
    /** `null` si l'API ne connaît pas la page (404). */
    findBySlug: async (slug: LegalPage.Slug): Promise<LegalPage.Entity | null> => {
      const { data, response } = await api.GET('/api/legal_pages/{slug}', {
        params: { path: { slug } },
      })
      if (response.status === 404) return null
      if (!data) throw new ApiError(response)
      return toLegalPage(data)
    },
  }
}
