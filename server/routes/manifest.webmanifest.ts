import { PRIMARY_COLOR } from '@/shared/theme/tokens'

import { FALLBACK_IDENTITY, serverSiteIdentityRepository } from '@/modules/identity/index.server'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const identity = await serverSiteIdentityRepository(
    config.apiUrl || config.public.apiUrl,
    getHeader(event, 'x-scenario'),
  )
    .find()
    .catch((error: unknown) => {
      console.error(error)
      return FALLBACK_IDENTITY
    })

  setHeader(event, 'content-type', 'application/manifest+json; charset=utf-8')
  return {
    name: identity.name,
    short_name: identity.name,
    lang: 'fr',
    start_url: '/',
    display: 'standalone',
    theme_color: identity.theme?.light.primary ?? PRIMARY_COLOR,
    background_color: '#ffffff',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
})
