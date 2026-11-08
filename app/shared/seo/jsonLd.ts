import { SITE } from '@/shared/config'

export const organizationJsonLd = (siteUrl: string, name: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name,
  url: new URL('/', siteUrl).href,
  logo: new URL('/icon-512.png', siteUrl).href,
  email: SITE.publisher.email,
})

export const websiteJsonLd = (siteUrl: string, name: string) => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name,
  url: new URL('/', siteUrl).href,
  inLanguage: 'fr',
})
