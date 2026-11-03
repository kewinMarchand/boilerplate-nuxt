import { useQuery } from '@tanstack/vue-query'
import { onServerPrefetch, watch } from 'vue'
import { createError, showError } from '#imports'

import { LegalPageLoadError } from '@/modules/content/infrastructure/LegalPageLoadError'
import { useLegalPageRepository } from '@/modules/content/infrastructure/legalPageRepository'

import type { LegalPage } from '@/modules/content/domain/legalPage'

const NOT_FOUND = { statusCode: 404, fatal: true }

export const useLegalPage = (slug: LegalPage.Slug) => {
  const repository = useLegalPageRepository()
  const query = useQuery({
    queryKey: ['legal-page', slug],
    queryFn: async () => {
      try {
        return await repository.findBySlug(slug)
      } catch (error) {
        console.error(error)
        throw new LegalPageLoadError({ cause: error })
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
    (page) => {
      if (page === null) showError(NOT_FOUND)
    },
    { immediate: true },
  )
  return query
}
