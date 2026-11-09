import { SITE } from '@/shared/config'

/** `logo` : adresse absolue de l'icône saisie dans l'identité du site, l'icône du front sans elle. */
export const organizationJsonLd = (siteUrl: string, name: string, logo?: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name,
  url: new URL('/', siteUrl).href,
  logo: logo ?? new URL('/icon-512.png', siteUrl).href,
  email: SITE.publisher.email,
})

/** `path` : accueil dans la langue de la page ; `inLanguage` : code de cette langue (`fr`). */
export const websiteJsonLd = (siteUrl: string, name: string, path: string, inLanguage: string) => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name,
  url: new URL(path, siteUrl).href,
  inLanguage,
})
