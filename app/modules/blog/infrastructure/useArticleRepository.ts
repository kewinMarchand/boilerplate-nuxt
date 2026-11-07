import { useApiClient } from '@/shared/api/useApiClient'

import { createArticleRepository } from './articleRepository'

/** Dépôt de la requête en cours, à créer dans un `setup` (hors des routes serveur Nitro). */
export const useArticleRepository = () => createArticleRepository(useApiClient())
