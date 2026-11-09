import { spawn } from 'node:child_process'
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { REAL_API } from '../support/fakeApi'
import { enableDarkMode, enableEnhancedMode, gotoHydrated } from '../support/page'
import { BILINGUAL_PORT } from '../support/ports'

import type { BrowserContext, Page } from '@playwright/test'
import type { ChildProcess } from 'node:child_process'

// Libellés anglais écrits en clair : le projet Node des tests ne résout pas l'alias `@/` des dictionnaires.

/**
 * Fixtures de l'API (contrat, section 29) : `X-Scenario: bilingual` active `en` après `fr`, avec ces
 * traductions ; tout le reste retombe sur le français.
 */
const PRODUCT = { fr: '/produit/monstera-deliciosa', en: '/en/produit/swiss-cheese-plant' }
const ARTICLE = {
  fr: '/blog/le-mode-accessibilite-renforcee',
  en: '/en/blog/enhanced-accessibility-mode',
}
const CATEGORY = {
  fr: '/catalogue/plantes-interieur/feuillages',
  en: '/en/catalogue/indoor-plants/foliage-plants',
}
const TAGLINE_EN = 'Website template with boilerplates-ui, equipped for QA and end-to-end testing.'

const EN_ROUTES = [
  '/en',
  '/en/catalogue',
  CATEGORY.en,
  PRODUCT.en,
  '/en/blog',
  ARTICLE.en,
  '/en/contact',
  '/en/taches',
  '/en/mentions-legales',
  '/en/plan-du-site',
  '/en/panier',
]

const hreflangs = (page: Page) =>
  page
    .locator('link[rel="alternate"][hreflang]')
    .evaluateAll((links) =>
      Object.fromEntries(
        links.map((link) => [link.getAttribute('hreflang'), link.getAttribute('href')]),
      ),
    )

const metaContent = (page: Page, selector: string) =>
  page.locator(selector).first().getAttribute('content')

test.describe('Site monolingue (API sans scénario)', () => {
  test('aucun sélecteur ni hreflang, et un préfixe de langue non activée répond 404', async ({
    page,
  }) => {
    await gotoHydrated(page, PRODUCT.fr)
    await expect(page.getByTestId('product-title')).toBeVisible()
    await expect(page.getByTestId('layout-languages')).toHaveCount(0)
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0)
    await expect(page.locator('meta[property="og:locale:alternate"]')).toHaveCount(0)

    const response = await page.goto(PRODUCT.en)
    expect(response?.status()).toBe(404)
  })
})

test.describe('Site bilingue fr, en (X-Scenario: bilingual fixé au démarrage)', () => {
  test.describe.configure({ mode: 'serial' })

  let appUrl = ''
  let app: ChildProcess | undefined

  // Variable lue à l'exécution : le build de la suite principale, servi sur son propre port
  test.beforeAll(async () => {
    const port = BILINGUAL_PORT + (test.info().project.name === 'mobile' ? 1 : 0)
    appUrl = `http://localhost:${port}`
    app = spawn('node', ['.output/server/index.mjs'], {
      env: {
        ...process.env,
        PORT: String(port),
        NUXT_PUBLIC_SITE_URL: appUrl,
        NUXT_PUBLIC_API_SCENARIO: 'bilingual',
      },
      stdio: 'ignore',
    })
    await expect
      .poll(async () => (await fetch(appUrl).catch(() => null))?.status, { timeout: 30_000 })
      .toBe(200)
  })

  test.afterAll(() => {
    app?.kill()
  })

  // L'API n'autorise pas l'origine de ce serveur : le navigateur du test ajoute l'en-tête CORS
  // aux réponses de l'API appelée depuis la page (tâches, envoi du contact).
  const allowApiFromApp = (context: BrowserContext) =>
    context.route(`${REAL_API}/**`, async (route) => {
      const response = await route.fetch()
      await route.fulfill({
        response,
        headers: {
          ...response.headers(),
          'access-control-allow-origin': appUrl,
          'access-control-allow-headers': 'content-type, accept, accept-language, x-scenario',
        },
      })
    })

  test.beforeEach(async ({ context }) => {
    await allowApiFromApp(context)
  })

  // Une requête encore en vol à la fin du test (tâches chargées dans le navigateur) ne fait pas échouer le suivant
  test.afterEach(async ({ context }) => {
    await context.unrouteAll({ behavior: 'ignoreErrors' })
  })

  const goto = (page: Page, path: string) => gotoHydrated(page, `${appUrl}${path}`)

  test('l’accueil anglais est préfixé, en anglais, et ses liens internes gardent le préfixe', async ({
    page,
  }) => {
    const response = await goto(page, '/en')

    expect(response?.status()).toBe(200)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.getByTestId('home-hero')).toContainText(TAGLINE_EN)
    await expect(page.getByTestId('home-tasks-link')).toHaveText('See the TanStack Query demo')
    await expect(page.getByTestId('home-tasks-link')).toHaveAttribute('href', '/en/taches')
    await expect(page.getByTestId('home-blog-all')).toHaveText('All articles')
    await expect(page.getByTestId('home-blog-all')).toHaveAttribute('href', '/en/blog')
    await expect(page.getByTestId('layout-logo')).toHaveAttribute('href', '/en')
    await expect(page.getByTestId('layout-skip-link')).toHaveText('Skip to main content')
  })

  test('la fiche produit anglaise sert le contenu, les libellés et le fil d’Ariane en anglais', async ({
    page,
  }) => {
    await goto(page, PRODUCT.en)

    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.getByTestId('product-title')).toHaveText('Swiss cheese plant')
    await expect(page.getByTestId('product-page')).toContainText('Availability')
    await expect(page.getByTestId('product-price')).toHaveText('€34.90')
    await expect(page.getByTestId('add-to-cart')).toHaveText('Add to cart')
    const breadcrumb = page.getByTestId('layout-breadcrumb')
    await expect(breadcrumb.getByRole('link').nth(1)).toHaveAttribute('href', '/en/catalogue')
    await expect(breadcrumb).toContainText('Indoor plants')
    await expect(page).toHaveTitle('Swiss cheese plant (Monstera deliciosa)')
  })

  test('le sélecteur mène à l’équivalent de la fiche dans l’autre langue', async ({ page }) => {
    await goto(page, PRODUCT.en)
    const french = page.getByTestId('layout-language-fr')

    await expect(page.getByTestId('layout-languages')).toHaveAttribute('aria-label', 'Language')
    await expect(page.getByTestId('layout-language-en')).toHaveAttribute('aria-current', 'true')
    await expect(french).toHaveText('Français')
    await expect(french).toHaveAttribute('lang', 'fr')
    await expect(french).toHaveAttribute('hreflang', 'fr')
    await expect(french).toHaveAttribute('href', PRODUCT.fr)

    await french.click()
    await expect(page).toHaveURL(`${appUrl}${PRODUCT.fr}`)
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
    await expect(page.getByTestId('product-title')).toHaveText('Monstera deliciosa')
    await expect(page.getByTestId('layout-language-fr')).toHaveAttribute('aria-current', 'true')
    await expect(page.getByTestId('layout-language-en')).toHaveAttribute('href', PRODUCT.en)
    await expect(page.getByTestId('layout-language-en')).toHaveText('English')
  })

  test('le sélecteur garde la catégorie et l’article dans l’autre langue', async ({ page }) => {
    await goto(page, CATEGORY.fr)
    await expect(page.getByTestId('layout-language-en')).toHaveAttribute('href', CATEGORY.en)

    await goto(page, CATEGORY.en)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Foliage plants')
    await expect(page.getByTestId('catalog-product-link').first()).toHaveAttribute(
      'href',
      /^\/en\/produit\//,
    )

    await goto(page, ARTICLE.en)
    await expect(page.getByTestId('article-title')).toHaveText('The enhanced accessibility mode')
    await expect(page.getByTestId('layout-language-fr')).toHaveAttribute('href', ARTICLE.fr)
  })

  test('sans équivalent (page introuvable), le sélecteur mène à l’accueil de l’autre langue', async ({
    page,
  }) => {
    await page.goto(`${appUrl}/en/route-inexistante`)

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found')
    await expect(page.getByTestId('layout-language-fr')).toHaveAttribute('href', '/')
    await expect(page.getByTestId('layout-language-en')).toHaveAttribute('href', '/en')
  })

  test('la navigation entre pages anglaises garde le préfixe', async ({ page }) => {
    await goto(page, '/en')
    await page.getByTestId('home-tasks-link').click()

    await expect(page).toHaveURL(`${appUrl}/en/taches`)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tasks')
    await expect(page.getByTestId('tasks-list')).toBeVisible()
  })

  test('hreflang, x-default, canonique et og:locale suivent la langue de la page', async ({
    page,
  }) => {
    await goto(page, PRODUCT.en)

    expect(await hreflangs(page)).toEqual({
      fr: `${appUrl}${PRODUCT.fr}`,
      en: `${appUrl}${PRODUCT.en}`,
      'x-default': `${appUrl}${PRODUCT.fr}`,
    })
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `${appUrl}${PRODUCT.en}`,
    )
    expect(await metaContent(page, 'meta[property="og:locale"]')).toBe('en_US')
    expect(await metaContent(page, 'meta[property="og:locale:alternate"]')).toBe('fr_FR')

    await goto(page, '/contact')
    expect(await hreflangs(page)).toEqual({
      fr: `${appUrl}/contact`,
      en: `${appUrl}/en/contact`,
      'x-default': `${appUrl}/contact`,
    })
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
  })

  test('les données structurées déclarent la langue de la page', async ({ page }) => {
    await goto(page, ARTICLE.en)
    const posting = (await page.locator('script[type="application/ld+json"]').allTextContents())
      .map((text) => JSON.parse(text) as { '@type': string; inLanguage?: string; url?: string })
      .find((item) => item['@type'] === 'BlogPosting')

    expect(posting).toMatchObject({ inLanguage: 'en-US', url: `${appUrl}${ARTICLE.en}` })
  })

  test('le sitemap liste chaque adresse dans chaque langue, avec ses équivalents', async ({
    request,
  }) => {
    const sitemap = await (await request.get(`${appUrl}/sitemap.xml`)).text()

    expect(sitemap).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"')
    expect(sitemap).toContain(`<loc>${appUrl}${PRODUCT.en}</loc>`)
    expect(sitemap).toContain(`<loc>${appUrl}${PRODUCT.fr}</loc>`)
    expect(sitemap).toContain(`<loc>${appUrl}${CATEGORY.en}</loc>`)
    expect(sitemap).toContain(`<loc>${appUrl}${ARTICLE.en}</loc>`)
    expect(sitemap).toContain(`<loc>${appUrl}/en/contact</loc>`)
    expect(sitemap).toContain(`hreflang="en" href="${appUrl}${PRODUCT.en}"`)
    expect(sitemap).toContain(`hreflang="fr" href="${appUrl}${PRODUCT.fr}"`)
  })

  test('le contact anglais envoie sa langue en Accept-Language', async ({ page }) => {
    await goto(page, '/en/contact')
    await page.getByTestId('contact-name').fill('Ada')
    await page.getByTestId('contact-email').fill('ada@example.com')
    await page.getByTestId('contact-message').fill('Does this plant like low light?')
    const request = page.waitForRequest(
      (candidate) =>
        candidate.method() === 'POST' && candidate.url().endsWith('/api/contact_messages'),
    )
    await page.getByTestId('contact-submit').click()

    expect((await request).headers()['accept-language']).toBe('en')
    // L'alerte de boilerplates-ui préfixe son texte d'un libellé écrit en dur en français (suivi)
    await expect(page.getByTestId('contact-success')).toContainText(
      'Thank you, your message has been sent.',
    )
  })

  for (const path of [
    '/de/contact',
    '/fr/contact',
    '/en/route-inexistante',
    '/en/produit/monstera-deliciosa',
  ]) {
    test(`${path} répond 404`, async ({ page }) => {
      const response = await page.goto(`${appUrl}${path}`)

      expect(response?.status()).toBe(404)
    })
  }

  for (const mode of ['normal', 'sombre', 'renforcé'] as const) {
    for (const path of EN_ROUTES) {
      test(`${path} en mode ${mode} ne présente aucune violation axe WCAG 2.1 AA`, async ({
        page,
        context,
      }) => {
        if (mode === 'renforcé') await enableEnhancedMode(context)
        if (mode === 'sombre') await enableDarkMode(context)
        await goto(page, path)
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze()
        expect(results.violations).toEqual([])
      })
    }
  }
})
