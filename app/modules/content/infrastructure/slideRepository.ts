import { ApiError } from '@/shared/api/client'
import { useApiClient } from '@/shared/api/useApiClient'

import { toSlide } from './http/slideTranslation'

/** Dépôt de la requête en cours, à créer dans un `setup`. */
export const useSlideRepository = () => {
  const api = useApiClient()
  return {
    findAll: async () => {
      const { data, response } = await api.GET('/api/slides')
      if (!data) throw new ApiError(response)
      return data.map(toSlide)
    },
  }
}
