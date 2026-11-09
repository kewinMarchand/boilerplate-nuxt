import { defineNuxtConfig } from 'nuxt/config'

import { LOCALE_PATTERN, LOCALE_ROUTE_SUFFIX } from './app/shared/i18n/locale'
import { PRIMARY_COLOR } from './app/shared/theme/tokens'
import { A11Y_MODE_BOOT_SCRIPT, JS_FLAG_SCRIPT } from './app/shared/ui/a11y-mode/a11yModeBootScript'
import { COLOR_SCHEME_BOOT_SCRIPT } from './app/shared/ui/color-scheme/colorSchemeBootScript'

export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: false },
  telemetry: false,
  hooks: {
    // Préchargés : l'entrée et ses imports statiques, de proche en proche (sans eux, le navigateur les
    // découvre après l'entrée, et la page attend une vague de plus) ; jamais les chunks des pages.
    'build:manifest': (manifest) => {
      const statics = new Set<string>()
      const visit = (key: string) => {
        for (const dependency of manifest[key]?.imports ?? []) {
          if (statics.has(dependency)) continue
          statics.add(dependency)
          visit(dependency)
        }
      }
      for (const [key, chunk] of Object.entries(manifest)) if (chunk.isEntry) visit(key)
      for (const [key, chunk] of Object.entries(manifest)) {
        if (!chunk.isEntry && !statics.has(key)) chunk.preload = false
      }
    },
    // Chaque page existe aussi sous un préfixe de langue (`/en/...`), vérifié contre les langues du
    // site par `app.vue` : un préfixe de langue non activée répond 404.
    'pages:extend': (pages) => {
      pages.push(
        ...pages.map((page) => ({
          ...page,
          name: `${page.name}${LOCALE_ROUTE_SUFFIX}`,
          path: `/:locale(${LOCALE_PATTERN})${page.path === '/' ? '' : page.path}`,
        })),
      )
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
    '@/shared/providers/i18n',
    { src: '@/shared/providers/hydrated', mode: 'client' },
    { src: '@/shared/providers/errorReporting', mode: 'client' },
    { src: '@/shared/providers/matomo', mode: 'client' },
    { src: '@/shared/providers/imageFallback', mode: 'client' },
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
      link: [{ rel: 'manifest', href: '/manifest.webmanifest' }],
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
      // Scénario de l'API (`X-Scenario`) fixé pour tous les appels, serveur et navigateur ; vide en production
      apiScenario: '',
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
      // Les e2e lisent les dictionnaires (`@/shared/i18n/dictionaries`), qui importent leurs types par l'alias
      compilerOptions: { paths: { '@/*': ['../app/*'] } },
      include: [
        '../vitest.config.ts',
        '../vitest.setup.ts',
        '../playwright.config.ts',
        '../tests/**/*',
      ],
    },
  },
})
