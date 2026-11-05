import { defineNuxtConfig } from 'nuxt/config'

import { PRIMARY_COLOR } from './app/shared/theme/tokens'
import { A11Y_MODE_BOOT_SCRIPT, JS_FLAG_SCRIPT } from './app/shared/ui/a11y-mode/a11yModeBootScript'
import { COLOR_SCHEME_BOOT_SCRIPT } from './app/shared/ui/color-scheme/colorSchemeBootScript'

export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: false },
  telemetry: false,
  hooks: {
    'build:manifest': (manifest) => {
      for (const chunk of Object.values(manifest)) {
        if (!chunk.isEntry) chunk.preload = false
      }
    },
  },
  modules: ['@nuxt/eslint', '@nuxt/fonts'],
  imports: { autoImport: false },
  experimental: {
    defaults: { nuxtLink: { prefetchOn: { visibility: false, interaction: true } } },
  },
  nitro: {
    imports: { autoImport: true },
    compressPublicAssets: { gzip: true, brotli: true },
  },
  plugins: [
    '@/shared/providers/vueQuery',
    { src: '@/shared/providers/hydrated', mode: 'client' },
    { src: '@/shared/providers/errorReporting', mode: 'client' },
    { src: '@/shared/providers/matomo', mode: 'client' },
  ],
  css: [
    '@/shared/theme/layers.css',
    '@kewinmarchand/boilerplates-ui/tokens/tokens.css',
    '@kewinmarchand/boilerplates-ui/css/index.css',
    '@/shared/theme/global.css',
  ],
  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/manifest.webmanifest' },
      ],
      meta: [
        { name: 'theme-color', content: PRIMARY_COLOR },
        { name: 'color-scheme', content: 'light dark' },
      ],
      script: [
        { innerHTML: JS_FLAG_SCRIPT, tagPosition: 'head' },
        { innerHTML: A11Y_MODE_BOOT_SCRIPT + COLOR_SCHEME_BOOT_SCRIPT, tagPosition: 'head' },
      ],
    },
  },
  runtimeConfig: {
    apiUrl: '',
    glitchtipDsn: '',
    public: {
      siteUrl: 'http://localhost:3010',
      apiUrl: 'http://localhost:8090',
      devTools: process.env.NODE_ENV !== 'production',
      glitchtipDsn: '',
      glitchtipEnvironment: '',
      matomoUrl: '',
      matomoSiteId: '',
    },
  },
  fonts: {
    families: [
      {
        name: 'Inter',
        provider: 'google',
        weights: [400, 500, 600, 700],
        styles: ['normal'],
        subsets: ['latin'],
        global: true,
        preload: true,
      },
    ],
  },
  typescript: {
    tsConfig: {
      compilerOptions: {
        noUnusedLocals: true,
        noUnusedParameters: true,
        types: ['vitest/globals', '@testing-library/jest-dom/vitest'],
      },
    },
    nodeTsConfig: {
      include: [
        '../vitest.config.ts',
        '../vitest.setup.ts',
        '../playwright.config.ts',
        '../tests/**/*',
      ],
    },
  },
})
