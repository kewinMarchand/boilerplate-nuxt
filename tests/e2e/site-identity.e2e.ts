import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { enableEnhancedMode, gotoHydrated } from '../support/page'
import { FAKE_API_PORT, IDENTITY_PORT } from '../support/ports'

import type { Page } from '@playwright/test'
import type { ChildProcess } from 'node:child_process'
import type { Server } from 'node:http'

const LIBRARY_PRIMARY = '#1d4ed8'
const LIBRARY_ENHANCED_PRIMARY = '#1e3a8a'
const REAL_API = process.env.NUXT_PUBLIC_API_URL ?? 'http://localhost:8090'

const primaryOnHtml = (page: Page) =>
  page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--bui-color-primary').trim(),
  )

test.describe('Identité du site, sans logo ni couleurs saisis', () => {
  test('nom de l’API dans le header, le hero et le titre, pictogramme et nom en texte', async ({
    page,
  }) => {
    await gotoHydrated(page, '/')
    const logo = page.getByTestId('layout-logo')

    await expect(logo).toHaveText('Boilerplate')
    await expect(page.getByTestId('layout-logo-image')).toHaveCount(0)
    await expect(page.getByTestId('home-hero').getByRole('heading', { level: 1 })).toHaveText(
      'Boilerplate',
    )
    await expect(page).toHaveTitle('Accueil · Boilerplate')
    await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute(
      'content',
      'Boilerplate',
    )
  })

  test('aucun bloc de style, jetons de la bibliothèque', async ({ page }) => {
    await gotoHydrated(page, '/')

    await expect(page.locator('style#site-theme')).toHaveCount(0)
    expect(await primaryOnHtml(page)).toBe(LIBRARY_PRIMARY)
  })

  test('manifeste au nom de l’API, couleur de la bibliothèque', async ({ request }) => {
    const manifest = await (await request.get('/manifest.webmanifest')).json()

    expect(manifest).toMatchObject({
      name: 'Boilerplate',
      short_name: 'Boilerplate',
      theme_color: LIBRARY_PRIMARY,
    })
  })
})

test.describe('Identité du site, API en erreur (X-Scenario: error)', () => {
  test.use({ extraHTTPHeaders: { 'X-Scenario': 'error' } })

  test('la page reste servie avec le nom de la configuration du front', async ({ page }) => {
    const response = await page.goto('/mentions-legales')

    expect(response?.status()).toBe(200)
    await expect(page.getByTestId('layout-logo')).toHaveText('Boilerplate Nuxt')
    await expect(page).toHaveTitle(/ · Boilerplate Nuxt$/)
  })
})

const LIGHT = {
  primary: '#c2410c',
  'primary-dark': '#923109',
  'on-primary': '#ffffff',
  'primary-surface-subtle': '#faf0ec',
  'primary-surface': '#f4ddd3',
  'primary-surface-strong': '#ebc2b1',
  secondary: '#0f766e',
  'secondary-dark': '#0b5852',
  'on-secondary': '#ffffff',
  'secondary-surface-subtle': '#ecf4f3',
  'secondary-surface': '#d4e6e5',
  'secondary-surface-strong': '#b2d3d1',
}

const DARK = {
  primary: '#da8d6d',
  'primary-dark': '#eabcaa',
  'on-primary': '#0f141d',
  'primary-surface-subtle': '#1f1e23',
  'primary-surface': '#272327',
  'primary-surface-strong': '#362b2c',
  secondary: '#6fada8',
  'secondary-dark': '#abcfcc',
  'on-secondary': '#0f141d',
  'secondary-surface-subtle': '#172028',
  'secondary-surface': '#1b262e',
  'secondary-surface-strong': '#213137',
}

// Logo au ratio 16:9 servi par le front lui-même : 71 px de large à 40 px de haut.
const IDENTITY = {
  name: 'Oraki',
  tagline: 'Plantes rares et tropicales, livrées chez vous.',
  logo: {
    alt: 'Oraki',
    width: 640,
    height: 360,
    sources: [{ type: 'image/webp', srcset: '/images/hero-640.webp 640w' }],
    src: '/images/hero-640.webp',
  },
  defaultColorScheme: 'dark',
  theme: { light: LIGHT, dark: DARK },
  shareImage: {
    alt: 'Serre tropicale Oraki',
    width: 1200,
    height: 630,
    sources: [{ type: 'image/webp', srcset: '/media/partage-oraki-1200.webp 1200w' }],
    src: '/media/partage-oraki-1200.webp',
  },
  icon: {
    png32: '/media/oraki-32.png',
    png180: '/media/oraki-180.png',
    png192: '/media/oraki-192.png',
    png512: '/media/oraki-512.png',
  },
}

const PAGE_METAS = [
  {
    page: 'contact',
    title: 'Écrire à Oraki',
    description: 'Une question sur une plante ? Écrivez-nous.',
  },
  { page: 'catalog', title: 'Toutes nos plantes', description: '' },
]
const PRODUCT_META = {
  metaTitle: 'Monstera deliciosa, la plante gruyère',
  metaDescription:
    'Le monstera deliciosa, ses grandes feuilles perforées et nos conseils d’entretien.',
}
const ARTICLE_META = { metaTitle: 'Un carrousel sans dépendance', metaDescription: '' }

/** Réponses remplacées par l'API factice, à partir de la réponse réelle quand elle sert de base. */
const OVERRIDES: Record<string, (upstream: unknown) => unknown> = {
  '/api/site-identity': () => IDENTITY,
  '/api/page-metas': () => PAGE_METAS,
  '/api/products/monstera-deliciosa': (product) => ({ ...(product as object), ...PRODUCT_META }),
  '/api/articles/un-carrousel-accessible-sans-dependance': (article) => ({
    ...(article as object),
    ...ARTICLE_META,
  }),
}

/** API factice : sert les réponses ci-dessus et relaie tout le reste à l'API réelle, sans toucher à sa base. */
const startFakeApi = (port: number) =>
  createServer(async (request, response) => {
    const upstream = await fetch(new URL(request.url ?? '/', REAL_API), {
      headers: { accept: request.headers.accept ?? '*/*' },
    })
    const override = OVERRIDES[request.url ?? '']
    if (override) {
      response
        .writeHead(200, { 'content-type': 'application/json' })
        .end(JSON.stringify(override(await upstream.json())))
      return
    }
    response
      .writeHead(upstream.status, { 'content-type': upstream.headers.get('content-type') ?? '' })
      .end(Buffer.from(await upstream.arrayBuffer()))
  }).listen(port)

test.describe('Identité du site, logo et couleurs saisis (API factice)', () => {
  test.describe.configure({ mode: 'serial' })

  let appUrl = ''
  let app: ChildProcess | undefined
  let fakeApi: Server | undefined

  test.beforeAll(async () => {
    const offset = test.info().project.name === 'mobile' ? 2 : 0
    const appPort = IDENTITY_PORT + offset
    const fakeApiPort = FAKE_API_PORT + offset
    appUrl = `http://localhost:${appPort}`
    fakeApi = startFakeApi(fakeApiPort)
    app = spawn('node', ['.output/server/index.mjs'], {
      env: {
        ...process.env,
        PORT: String(appPort),
        NUXT_PUBLIC_SITE_URL: appUrl,
        NUXT_API_URL: `http://localhost:${fakeApiPort}`,
      },
      stdio: 'ignore',
    })
    await expect
      .poll(async () => (await fetch(appUrl).catch(() => null))?.status, { timeout: 30_000 })
      .toBe(200)
  })

  test.afterAll(() => {
    app?.kill()
    fakeApi?.close()
  })

  test('le logo remplace pictogramme et nom dans le lien du header', async ({ page }) => {
    await gotoHydrated(page, appUrl)
    const logo = page.getByTestId('layout-logo')
    const image = page.getByTestId('layout-logo-image')

    await expect(logo).toHaveAccessibleName('Oraki')
    await expect(logo.locator('span')).toHaveCount(0)
    await expect(logo.locator('img')).toHaveCount(1)
    await expect(image).toHaveAttribute('alt', 'Oraki')
    await expect(image).toHaveAttribute('fetchpriority', 'high')
    await expect(image).not.toHaveAttribute('loading', 'lazy')
    expect((await image.boundingBox())?.height).toBe(40)
    await expect(page).toHaveTitle('Accueil · Oraki')
    await expect(page.getByTestId('home-hero')).toContainText(IDENTITY.tagline)
  })

  test('thème servi par défaut : sombre, couleurs sombres de l’API', async ({ page }) => {
    await gotoHydrated(page, appUrl)

    await expect(page.locator('html')).toHaveAttribute('data-color-scheme', 'dark')
    await expect(page.locator('style#site-theme')).toHaveCount(1)
    expect(await primaryOnHtml(page)).toBe(DARK.primary)
  })

  test('le choix mémorisé l’emporte : clair, couleurs claires de l’API', async ({
    page,
    context,
  }) => {
    await context.addInitScript(() => localStorage.setItem('color-scheme', 'light'))
    await gotoHydrated(page, appUrl)

    await expect(page.locator('html')).toHaveAttribute('data-color-scheme', 'light')
    expect(await primaryOnHtml(page)).toBe(LIGHT.primary)
  })

  test('« système » reste un choix avec un défaut sombre : auto après rechargement', async ({
    page,
  }) => {
    await gotoHydrated(page, appUrl)
    await page.getByTestId('color-scheme-toggle').click()
    await page.getByTestId('color-scheme-option-auto').click()
    expect(await page.evaluate(() => localStorage.getItem('color-scheme'))).toBe('auto')

    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-color-scheme', 'auto')
  })

  test('mode renforcé : couleurs de la bibliothèque', async ({ page, context }) => {
    await enableEnhancedMode(context)
    await gotoHydrated(page, appUrl)

    expect(await primaryOnHtml(page)).toBe(LIBRARY_ENHANCED_PRIMARY)
  })

  test('manifeste au nom, à la couleur principale et aux icônes de l’API', async ({ request }) => {
    const manifest = await (await request.get(`${appUrl}/manifest.webmanifest`)).json()

    expect(manifest).toMatchObject({ name: 'Oraki', theme_color: LIGHT.primary })
    expect(manifest.icons.map((icon: { src: string }) => icon.src)).toEqual([
      IDENTITY.icon.png192,
      IDENTITY.icon.png512,
    ])
  })

  test('icône saisie : favicon 32 px et icône Apple de l’API, sans les fichiers du front', async ({
    page,
  }) => {
    await page.goto(appUrl)

    await expect(page.locator('link[rel="icon"]')).toHaveCount(1)
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', IDENTITY.icon.png32)
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute('sizes', '32x32')
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute('type', 'image/png')
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
      'href',
      IDENTITY.icon.png180,
    )
  })

  test('image de partage saisie : og:image des pages sans image propre', async ({ page }) => {
    await page.goto(`${appUrl}/mentions-legales`)

    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      `${appUrl}/media/partage-oraki-1200.webp`,
    )
    await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute(
      'content',
      IDENTITY.shareImage.alt,
    )

    await page.goto(`${appUrl}/produit/monstera-deliciosa`)
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      /\/media\/[0-9a-f]+-800\.webp$/,
    )
  })

  test('sans titre saisi, la page fixe garde son titre et le nom du site', async ({ page }) => {
    await page.goto(`${appUrl}/mentions-legales`)

    await expect(page).toHaveTitle('Mentions légales · Oraki')
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      'content',
      'Mentions légales',
    )
  })

  test('titre et description saisis pour une page fixe, titre servi sans le nom du site', async ({
    page,
  }) => {
    await gotoHydrated(page, `${appUrl}/contact`)

    await expect(page).toHaveTitle('Écrire à Oraki')
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      PAGE_METAS[0]?.description ?? '',
    )
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      'content',
      'Écrire à Oraki',
    )
  })

  test('titre saisi pour le catalogue, sans le nom du site : la racine seulement, description du front', async ({
    page,
  }) => {
    await page.goto(`${appUrl}/catalogue`)
    await expect(page).toHaveTitle('Toutes nos plantes')
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      /^Catalogue : plantes/,
    )

    await page.goto(`${appUrl}/catalogue/plantes-interieur/feuillages`)
    await expect(page).toHaveTitle('Feuillages · Oraki')
  })

  test('métadonnées saisies d’un produit et d’un article : titre servi tel quel, titre affiché inchangé', async ({
    page,
  }) => {
    await gotoHydrated(page, `${appUrl}/produit/monstera-deliciosa`)
    await expect(page).toHaveTitle(PRODUCT_META.metaTitle)
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      'content',
      PRODUCT_META.metaTitle,
    )
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      PRODUCT_META.metaDescription,
    )
    await expect(page.getByTestId('product-title')).toHaveText('Monstera deliciosa')

    await page.goto(`${appUrl}/blog/un-carrousel-accessible-sans-dependance`)
    await expect(page).toHaveTitle(ARTICLE_META.metaTitle)
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      /^Défilement natif/,
    )
    await expect(page.getByTestId('article-title')).toHaveText(
      'Un carrousel accessible sans dépendance',
    )
  })

  for (const mode of ['clair', 'sombre', 'renforcé'] as const) {
    test(`aucune violation axe WCAG 2.1 AA en mode ${mode}`, async ({ page, context }) => {
      if (mode === 'clair') {
        await context.addInitScript(() => localStorage.setItem('color-scheme', 'light'))
      }
      if (mode === 'renforcé') await enableEnhancedMode(context)
      await gotoHydrated(page, appUrl)

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()
      expect(results.violations).toEqual([])
    })
  }
})
