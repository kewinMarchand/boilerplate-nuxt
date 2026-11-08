import { SITE } from '@/shared/config'

import type { SiteIdentity } from '../domain/siteIdentity'

/** Identité servie quand l'API ne répond pas : la configuration du front, sans logo, icône ni couleurs. */
export const FALLBACK_IDENTITY: SiteIdentity.Entity = {
  name: SITE.name,
  tagline: SITE.description,
  logo: null,
  shareImage: null,
  icon: null,
  defaultColorScheme: 'auto',
  theme: null,
  salesEnabled: SITE.salesEnabled,
}
