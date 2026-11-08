import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { enableDarkMode, enableEnhancedMode, gotoHydrated, linkTo } from '../support/page'

import type { APIRequestContext, Page } from '@playwright/test'

const API_URL = process.env.NUXT_PUBLIC_API_URL ?? 'http://localhost:8090'
const FAILING = 'monstera-deliciosa'
const WORKING = 'monstera-adansonii'

const productCard = (page: Page, slug: string) =>
  page
    .getByTestId('catalog-product')
    .filter({ has: linkTo(page, 'catalog-product-link', `/produit/${slug}`) })

const imageFile = async (request: APIRequestContext, slug: string) => {
  const product = (await (await request.get(`${API_URL}/api/products/${slug}`)).json()) as {
    image: { src: string }
  }
  return new URL(product.image.src).pathname.replace(/-\d+\.\w+$/, '')
}

const failImage = async (page: Page, request: APIRequestContext) => {
  const file = await imageFile(request, FAILING)
  await page.route(
    (url) => url.pathname.startsWith(`${file}-`),
    (route) => route.fulfill({ status: 404 }),
  )
}

test.describe('Image de l’API en échec', () => {
  test('le picture est marqué, l’image masquée, la carte garde ses dimensions', async ({
    page,
    request,
  }) => {
    await gotoHydrated(page, '/catalogue')
    const card = productCard(page, FAILING)
    await expect(card.locator('picture img')).toHaveJSProperty('complete', true)
    const before = await card.boundingBox()

    await failImage(page, request)
    await gotoHydrated(page, '/catalogue')

    await expect(card.locator('picture')).toHaveAttribute('data-image-error', '')
    await expect(card.locator('picture img')).toHaveCSS('opacity', '0')
    await expect(card.locator('picture img')).toHaveAttribute('alt', /.+/)
    expect(await card.boundingBox()).toEqual(before)
  })

  test('une image chargée n’est pas marquée', async ({ page, request }) => {
    await failImage(page, request)
    await gotoHydrated(page, '/catalogue')

    const picture = productCard(page, WORKING).locator('picture')
    await expect(picture.locator('img')).toHaveJSProperty('complete', true)
    expect(
      await picture.locator('img').evaluate((img: HTMLImageElement) => img.naturalWidth),
    ).toBeGreaterThan(0)
    await expect(picture).not.toHaveAttribute('data-image-error')
    await expect(picture.locator('img')).toHaveCSS('opacity', '1')
  })

  test('une vignette de la galerie en échec est marquée, le bouton garde sa taille', async ({
    page,
    request,
  }) => {
    const product = (await (await request.get(`${API_URL}/api/products/${FAILING}`)).json()) as {
      gallery: { src: string }[]
    }
    const thumbFile = new URL(product.gallery[0]?.src ?? '').pathname
    await gotoHydrated(page, `/produit/${FAILING}`)
    const thumb = page.getByTestId('product-gallery-thumb').nth(1)
    await thumb.scrollIntoViewIfNeeded()
    await expect(thumb.locator('picture img')).toHaveJSProperty('complete', true)
    const before = await thumb.boundingBox()

    await page.route(
      (url) => url.pathname === thumbFile,
      (route) => route.fulfill({ status: 404 }),
    )
    await gotoHydrated(page, `/produit/${FAILING}`)
    await thumb.scrollIntoViewIfNeeded()

    await expect(thumb.locator('picture')).toHaveAttribute('data-image-error', '')
    await expect(thumb.locator('picture img')).toHaveCSS('opacity', '0')
    await expect(
      page.getByTestId('product-gallery-thumb').first().locator('picture'),
    ).not.toHaveAttribute('data-image-error')
    expect(await thumb.boundingBox()).toEqual(before)
  })

  for (const route of [
    '/',
    '/catalogue',
    `/produit/${WORKING}`,
    `/produit/${FAILING}`,
    '/blog/le-mode-accessibilite-renforcee',
  ]) {
    test(`${route} : le fond de remplacement prend les coins de l’image`, async ({ page }) => {
      await gotoHydrated(page, route)
      await expect(page.locator('picture.bui-picture').first()).toBeVisible()

      const mismatches = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>('picture.bui-picture')].flatMap((picture) => {
          picture.toggleAttribute('data-image-error', true)
          const image = picture.querySelector('img')
          if (!image) return []
          const imageRadius = getComputedStyle(image).borderRadius
          const pictureRadius = getComputedStyle(picture).borderRadius
          const clipped = picture.closest('.bui-card') !== null
          return imageRadius === pictureRadius || clipped ? [] : [{ imageRadius, pictureRadius }]
        }),
      )
      expect(mismatches).toEqual([])
    })
  }

  for (const mode of ['normal', 'sombre', 'renforcé'] as const) {
    test(`mode ${mode} : aucune violation axe WCAG 2.1 AA`, async ({ page, context, request }) => {
      if (mode === 'renforcé') await enableEnhancedMode(context)
      if (mode === 'sombre') await enableDarkMode(context)
      await failImage(page, request)
      await gotoHydrated(page, '/catalogue')
      await expect(productCard(page, FAILING).locator('picture')).toHaveAttribute(
        'data-image-error',
        '',
      )

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()
      expect(results.violations).toEqual([])
    })
  }
})
