import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { serveWithFakeApi } from '../support/fakeApi'
import { enableDarkMode, enableEnhancedMode, gotoHydrated } from '../support/page'
import { SALES_OFF_FAKE_API_PORT, SALES_OFF_PORT } from '../support/ports'

import type { Page } from '@playwright/test'

const SLUG = 'monstera-deliciosa'
const PRODUCT = `/produit/${SLUG}`
const INQUIRY = `/contact?produit=${SLUG}`
const CART = [{ slug: SLUG, name: 'Monstera deliciosa', price: 3490, quantity: 2 }]

const fillContactForm = async (page: Page) => {
  await page.getByTestId('contact-name').fill('Ada')
  await page.getByTestId('contact-email').fill('ada@exemple.fr')
  await page
    .getByTestId('contact-message')
    .fill('Ce monstera supporte-t-il une pièce peu lumineuse ?')
}

const productJsonLd = async (page: Page) =>
  (await page.locator('script[type="application/ld+json"]').allTextContents())
    .map((text) => JSON.parse(text) as { '@type': string; offers?: unknown })
    .find((entry) => entry['@type'] === 'Product')

test.describe('Vente en ligne active', () => {
  test('la fiche garde le bouton d’ajout au panier, sans lien de demande de renseignement', async ({
    page,
  }) => {
    await gotoHydrated(page, PRODUCT)

    await expect(page.getByTestId('add-to-cart')).toBeVisible()
    await expect(page.getByTestId('product-price')).toBeVisible()
    await expect(page.getByTestId('product-inquiry')).toHaveCount(0)
    await expect(page.getByTestId('cart-link')).toBeVisible()
  })

  test('/contact?produit= : ligne du produit liée à la fiche, canonique /contact', async ({
    page,
  }) => {
    await gotoHydrated(page, INQUIRY)

    const line = page.getByTestId('contact-product')
    await expect(line).toHaveText(/Votre demande concerne :\s+Monstera deliciosa/)
    await expect(line.locator(`a[href="${PRODUCT}"]`)).toHaveCount(1)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/contact$/)
  })

  test('/contact avec un produit inconnu : formulaire de contact simple', async ({ page }) => {
    await gotoHydrated(page, '/contact?produit=produit-inconnu')

    await expect(page.getByTestId('contact-name')).toBeVisible()
    await expect(page.getByTestId('contact-product')).toHaveCount(0)
  })

  test('envoi d’une demande de renseignement : produit dans le corps, confirmation adaptée', async ({
    page,
  }) => {
    await gotoHydrated(page, INQUIRY)
    await fillContactForm(page)
    const request = page.waitForRequest(
      (candidate) =>
        candidate.method() === 'POST' && candidate.url().endsWith('/api/contact_messages'),
    )
    await page.getByTestId('contact-submit').click()

    expect((await request).postDataJSON()).toMatchObject({ product: SLUG })
    await expect(page.getByTestId('contact-success')).toContainText(
      'Votre demande de renseignement a bien été envoyée.',
    )
  })
})

test.describe('Vente en ligne coupée (API factice, salesEnabled: false)', () => {
  test.describe.configure({ mode: 'serial' })

  let appUrl = ''
  let stop: (() => void) | undefined

  test.beforeAll(async () => {
    const offset = test.info().project.name === 'mobile' ? 2 : 0
    ;({ appUrl, stop } = await serveWithFakeApi(
      SALES_OFF_PORT + offset,
      SALES_OFF_FAKE_API_PORT + offset,
      { '/api/site-identity': (identity) => ({ ...(identity as object), salesEnabled: false }) },
    ))
  })

  test.afterAll(() => stop?.())

  test('catalogue : aucun prix, ni filtre ni tri par prix', async ({ page }) => {
    await gotoHydrated(page, `${appUrl}/catalogue`)

    await expect(page.getByTestId('catalog-product').first()).toBeVisible()
    await expect(page.getByTestId('catalog-product-price')).toHaveCount(0)
    await expect(page.getByTestId('catalog-filter-price-min')).toHaveCount(0)
    await expect(page.getByTestId('catalog-filter-price-max')).toHaveCount(0)
    const sorts = await page
      .getByTestId('catalog-sort')
      .locator('option')
      .evaluateAll((options) => options.map((option) => option.getAttribute('value')))
    expect(sorts).toEqual(['pertinence', 'nom'])
  })

  test('catalogue : prix_min, prix_max et tri par prix ignorés dans l’URL', async ({ page }) => {
    await gotoHydrated(page, `${appUrl}/catalogue`)
    const total = await page.getByTestId('catalog-results-count').textContent()

    await gotoHydrated(page, `${appUrl}/catalogue?prix_min=1000&prix_max=2000&tri=prix-desc`)

    await expect(page.getByTestId('catalog-results-count')).toHaveText(total ?? '')
    await expect(page.getByTestId('catalog-sort')).toHaveValue('pertinence')
    await expect(page.getByTestId('catalog-active-filters')).toHaveCount(0)
  })

  test('accueil : carrousel sans prix', async ({ page }) => {
    await gotoHydrated(page, appUrl)
    const carousel = page.getByTestId('home-carousel')
    await carousel.scrollIntoViewIfNeeded()

    await expect(carousel.getByTestId('carousel-slide-link').first()).toBeVisible()
    await expect(carousel).not.toContainText('€')
  })

  test('fiche : ni prix, ni panier, JSON-LD sans offre, produits similaires sans prix', async ({
    page,
  }) => {
    await gotoHydrated(page, `${appUrl}${PRODUCT}`)

    await expect(page.getByTestId('product-title')).toHaveText('Monstera deliciosa')
    await expect(page.getByTestId('product-price')).toHaveCount(0)
    await expect(page.getByTestId('product-page')).not.toContainText('€')
    await expect(page.getByTestId('add-to-cart')).toHaveCount(0)
    await expect(page.getByTestId('cart-link')).toHaveCount(0)
    const similar = page.getByTestId('product-similar')
    await expect(similar.getByTestId('carousel-slide-link').first()).toBeAttached()
    await expect(similar).not.toContainText('€')
    const product = await productJsonLd(page)
    expect(product).toBeDefined()
    expect(product).not.toHaveProperty('offers')
  })

  test('fiche : lien de demande de renseignement, 44 px au moins, nommé par le produit', async ({
    page,
  }) => {
    await gotoHydrated(page, `${appUrl}${PRODUCT}`)
    const inquiry = page.getByTestId('product-inquiry')

    await expect(inquiry).toHaveAccessibleName('Demande de renseignement sur Monstera deliciosa')
    await expect(inquiry).toHaveAttribute('href', INQUIRY)
    expect((await inquiry.boundingBox())?.height).toBeGreaterThanOrEqual(44)
  })

  test('fiche en rupture de stock : lien de demande de renseignement présent', async ({ page }) => {
    await gotoHydrated(page, `${appUrl}/produit/monstera-thai-constellation`)

    await expect(page.getByTestId('product-inquiry')).toHaveAttribute(
      'href',
      '/contact?produit=monstera-thai-constellation',
    )
  })

  test('/panier répond 404, le panier stocké n’est ni lu ni effacé', async ({ page, context }) => {
    await context.addInitScript(() => {
      const getItem = Storage.prototype.getItem
      const keys: string[] = []
      Object.assign(window, { readKeys: keys })
      Storage.prototype.getItem = function (key) {
        keys.push(key)
        return getItem.call(this, key)
      }
    })
    await page.goto(appUrl)
    await page.evaluate((lines) => localStorage.setItem('panier', JSON.stringify(lines)), CART)

    const response = await page.goto(`${appUrl}/panier`)
    expect(response?.status()).toBe(404)
    await gotoHydrated(page, `${appUrl}${PRODUCT}`)

    await expect(page.getByTestId('cart-link')).toHaveCount(0)
    expect(await page.evaluate(() => Reflect.get(window, 'readKeys'))).not.toContain('panier')
    expect(await page.evaluate(() => localStorage.getItem('panier'))).toBe(JSON.stringify(CART))
  })

  test('« Demande de renseignement » ouvre le contact du produit, l’envoi porte le produit', async ({
    page,
  }) => {
    await gotoHydrated(page, `${appUrl}${PRODUCT}`)
    await page.getByTestId('product-inquiry').click()

    await expect(page).toHaveURL(`${appUrl}${INQUIRY}`)
    await expect(page.getByTestId('contact-product')).toContainText('Monstera deliciosa')
    await fillContactForm(page)
    const request = page.waitForRequest(
      (candidate) =>
        candidate.method() === 'POST' && candidate.url().endsWith('/api/contact_messages'),
    )
    await page.getByTestId('contact-submit').click()

    expect((await request).postDataJSON()).toMatchObject({ product: SLUG })
    await expect(page.getByTestId('contact-success')).toContainText(
      'Votre demande de renseignement a bien été envoyée.',
    )
  })

  test('sans JavaScript, le lien de demande de renseignement est servi', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto(`${appUrl}${PRODUCT}`)

    await expect(page.getByTestId('product-inquiry')).toHaveAttribute('href', INQUIRY)
    await context.close()
  })

  for (const mode of ['clair', 'sombre', 'renforcé'] as const) {
    for (const path of [PRODUCT, INQUIRY]) {
      test(`aucune violation axe WCAG 2.1 AA sur ${path} en mode ${mode}`, async ({
        page,
        context,
      }) => {
        if (mode === 'clair') {
          await context.addInitScript(() => localStorage.setItem('color-scheme', 'light'))
        }
        if (mode === 'sombre') await enableDarkMode(context)
        if (mode === 'renforcé') await enableEnhancedMode(context)
        await gotoHydrated(page, `${appUrl}${path}`)

        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze()
        expect(results.violations).toEqual([])
      })
    }
  }
})
