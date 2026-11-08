import { useApiClient } from '@/shared/api/useApiClient'

import { createSiteIdentityRepository } from './siteIdentityRepository'

/** Fichier à part : la route Nitro du manifeste importe `siteIdentityRepository.ts`, sans les imports virtuels de l'app. */
export const useSiteIdentityRepository = () => createSiteIdentityRepository(useApiClient())
