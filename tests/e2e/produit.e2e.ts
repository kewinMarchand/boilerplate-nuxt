import { expect, test } from '@playwright/test'

import { gotoHydrated } from '../support/page'

const PRODUCT = '/produit/monstera-deliciosa'

test.describe('Fiche produit', () => {
  test('s’ouvre depuis une carte du catalogue', async ({ page }) => {
    await gotoHydrated(page, '/catalogue')

    const card = page.getByTestId('catalog-product').first()
    const name = ((await card.locator('h2').textContent()) ?? '').trim()
    await card.getByTestId('catalog-product-link').click()

    await expect(page).toHaveURL(/\/produit\/[a-z0-9-]+$/)
    await expect(page.getByTestId('product-title')).toHaveText(name)
  })

  test('affiche le nom, le prix, la description, les caractéristiques, l’image de l’API et le chemin de sa catégorie', async ({
    page,
  }) => {
    await page.goto(PRODUCT)

    await expect(page.getByTestId('product-title')).toHaveText('Monstera deliciosa')
    await expect(page.getByTestId('product-price')).toHaveText(/34,90\s€/)
    const description = page.getByTestId('product-description').locator('p')
    await expect(description).toHaveCount(2)
    await expect(description.first()).toContainText('Grandes feuilles vert profond')
    await expect(page.getByTestId('product-page').locator('dd').first()).toHaveText('Mi-ombre')
    const image = page.getByTestId('product-page').locator('img').first()
    await expect(image).toHaveAttribute('fetchpriority', 'high')
    await expect
      .poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth))
      .toBeGreaterThan(0)
    await expect(
      page.locator('a[href="/catalogue/plantes-interieur/feuillages/monstera"]').first(),
    ).toBeAttached()
  })

  test('liste ses attributs configurables avec leur unité', async ({ page }) => {
    await page.goto(PRODUCT)

    const attributes = page.getByTestId('product-attributes')
    await expect(attributes.locator('dt')).toHaveText(['Feuillage', 'Hauteur adulte'])
    await expect(attributes.locator('dd')).toHaveText(['Persistant', '300 cm'])
  })

  test('n’affiche pas de liste d’attributs sans attribut renseigné', async ({ page }) => {
    await page.goto('/produit/anthurium-andreanum-rouge')

    await expect(page.getByTestId('product-title')).toBeVisible()
    await expect(page.getByTestId('product-attributes')).toHaveCount(0)
  })

  test('expose ses données structurées de produit', async ({ page }) => {
    await page.goto(PRODUCT)

    const data = (await page.locator('script[type="application/ld+json"]').allTextContents()).map(
      (text) =>
        JSON.parse(text) as { '@type': string; description?: string; offers?: { price: string } },
    )
    expect(data.map((item) => item['@type'])).toEqual(
      expect.arrayContaining(['Product', 'BreadcrumbList']),
    )
    const product = data.find((item) => item['@type'] === 'Product')
    expect(product?.offers?.price).toBe('34.90')
    expect(product?.description).toMatch(/^Grandes feuilles vert profond.+aide à grimper\.$/)
  })

  test('propose les autres produits de sa catégorie, sans lui-même', async ({ page }) => {
    await gotoHydrated(page, PRODUCT)

    const similar = page.getByTestId('product-similar')
    await expect(similar.getByRole('heading', { level: 2 })).toHaveText('Produits similaires')
    const links = similar.getByTestId('carousel-slide-link')
    await expect(links).toHaveText(['Monstera adansonii', 'Monstera Thai Constellation'])
    await expect(similar).not.toContainText('Monstera deliciosa')
    const name = ((await links.first().textContent()) ?? '').trim()
    await links.first().click()

    await expect(page).toHaveURL(/\/produit\/monstera-/)
    await expect(page.getByTestId('product-title')).toHaveText(name)
  })

  test('le carrousel des produits similaires déborde du conteneur sans défilement de la page', async ({
    page,
  }) => {
    // Une catégorie a au plus 3 produits : la liste lue par le navigateur après une navigation est allongée
    await page.route(
      (url) => url.pathname === '/api/products' && url.searchParams.has('category'),
      async (route) => {
        const products = (await (await route.fetch()).json()) as { id: number; slug: string }[]
        const longer = Array.from({ length: 9 }, (_, index) => {
          const product = products[index % products.length]
          return { ...product, id: 1000 + index, slug: `${product?.slug}-${index}` }
        })
        await route.fulfill({ json: longer })
      },
    )
    await gotoHydrated(page, PRODUCT)
    await page.getByTestId('product-similar').getByTestId('carousel-slide-link').first().click()
    await expect(page).toHaveURL(/\/produit\/monstera-/)

    const similar = page.getByTestId('product-similar')
    await expect(similar.getByTestId('carousel-slide')).toHaveCount(8)
    await similar.scrollIntoViewIfNeeded()
    await expect(similar.getByTestId('carousel-dot').first()).toBeVisible()
    const section = await similar.boundingBox()
    const firstSlide = await similar.getByTestId('carousel-slide').first().boundingBox()
    if (!section || !firstSlide) throw new Error('Carrousel introuvable')
    const pointIsOnSlide = await page.evaluate(
      ({ x, y }) =>
        document.elementFromPoint(x, y)?.closest('[data-testid="carousel-slide"]') !== null,
      { x: section.x + section.width + 8, y: firstSlide.y + firstSlide.height / 3 },
    )
    expect(pointIsOnSlide).toBe(true)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })

  test('répond 404 pour un produit inconnu', async ({ page }) => {
    const response = await page.goto('/produit/produit-inconnu')

    expect(response?.status()).toBe(404)
  })
})

test.describe('Galerie de la fiche produit', () => {
  test('vignettes en boutons, image principale comprise, la première affichée', async ({
    page,
  }) => {
    await gotoHydrated(page, PRODUCT)

    const thumbs = page.getByTestId('product-gallery').getByTestId('product-gallery-thumb')
    await expect(thumbs).toHaveCount(3)
    await expect(thumbs.first()).toHaveAttribute('aria-current', 'true')
    await expect(thumbs.nth(1)).not.toHaveAttribute('aria-current')
    await expect(thumbs.nth(1)).toHaveAccessibleName('Voir l’image 2 sur 3')
    await expect(thumbs.first().locator('img')).toHaveAttribute('loading', 'lazy')
    const image = page.getByTestId('product-gallery-image')
    await expect(image).toHaveAttribute('fetchpriority', 'high')
    await expect(image).not.toHaveAttribute('loading', 'lazy')
  })

  test('un clic sur une vignette remplace l’image affichée', async ({ page }) => {
    await gotoHydrated(page, PRODUCT)
    const thumbs = page.getByTestId('product-gallery-thumb')
    const image = page.getByTestId('product-gallery-image')
    const first = (await image.getAttribute('src')) ?? ''

    await thumbs.nth(2).click()

    await expect(thumbs.nth(2)).toHaveAttribute('aria-current', 'true')
    await expect(thumbs.first()).not.toHaveAttribute('aria-current')
    await expect(image).not.toHaveAttribute('src', first)
  })

  test('les flèches gauche et droite passent d’une vignette à l’autre', async ({ page }) => {
    await gotoHydrated(page, PRODUCT)
    const thumbs = page.getByTestId('product-gallery-thumb')
    await thumbs.first().focus()

    await page.keyboard.press('ArrowRight')
    await expect(thumbs.nth(1)).toBeFocused()
    await expect(thumbs.nth(1)).toHaveAttribute('aria-current', 'true')

    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowLeft')
    await expect(thumbs.nth(2)).toBeFocused()
    await expect(thumbs.nth(2)).toHaveAttribute('aria-current', 'true')
  })

  test('sans galerie, la fiche garde son image seule', async ({ page }) => {
    await page.goto('/produit/monstera-adansonii')

    await expect(page.getByTestId('product-title')).toBeVisible()
    await expect(page.getByTestId('product-gallery')).toHaveCount(0)
    await expect(page.getByTestId('product-page').locator('img')).toHaveCount(1)
  })

  test.describe('sans JavaScript', () => {
    test.use({ javaScriptEnabled: false })

    test('les vignettes sont des liens vers l’image en grand', async ({ page }) => {
      await page.goto(PRODUCT)

      await expect(page.getByTestId('product-gallery-thumb').first()).toBeHidden()
      const links = page.getByTestId('product-gallery-thumb-link')
      await expect(links).toHaveCount(3)
      await expect(links.first()).toBeVisible()
      await expect(links.first()).toHaveAttribute('href', /^https?:\/\/.+\.webp$/)
      await expect(links.first()).toHaveAccessibleName('Voir l’image 1 sur 3')
    })
  })
})
