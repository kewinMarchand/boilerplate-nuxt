import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { enableDarkMode, enableEnhancedMode, gotoHydrated, isMobile, linkTo } from '../support/page'
import { DEV_ROUTES, ROUTES } from '../support/routes'

import type { Page } from '@playwright/test'

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

const expectNoViolation = async (page: Page) => {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()
  expect(results.violations).toEqual([])
}

for (const mode of ['normal', 'sombre', 'renforcé'] as const) {
  test.describe(`Mode ${mode}`, () => {
    test.beforeEach(async ({ context }) => {
      if (mode === 'renforcé') await enableEnhancedMode(context)
      if (mode === 'sombre') await enableDarkMode(context)
    })

    for (const route of [
      ...ROUTES,
      ...DEV_ROUTES,
      '/catalogue?exposition=mi-ombre&tri=prix-asc',
      '/catalogue?attr-feuillage=persistant',
      '/blog?rubrique=conseils',
      '/blog/un-carrousel-accessible-sans-dependance',
      '/produit/strelitzia-reginae',
      '/panier',
    ]) {
      test(`la page ${route} ne présente aucune violation axe WCAG 2.1 AA`, async ({ page }) => {
        await gotoHydrated(page, route)
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
        await expectNoViolation(page)
      })
    }

    for (const route of ['/route-inexistante', '/_erreur-test']) {
      test(`la page d’erreur ${route} ne présente aucune violation axe`, async ({ page }) => {
        await page.goto(route)
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
        await expectNoViolation(page)
      })
    }

    test('le panier rempli ne présente aucune violation axe', async ({ page }) => {
      await gotoHydrated(page, '/produit/monstera-deliciosa')
      await page.getByTestId('add-to-cart').click()
      await expect(page.getByTestId('cart-count')).toHaveText('1')
      await gotoHydrated(page, '/panier')
      await expect(page.getByTestId('cart-line')).toHaveCount(1)
      await expectNoViolation(page)
    })

    test('le menu ouvert ne présente aucune violation axe', async ({ page }, testInfo) => {
      await gotoHydrated(page, '/')
      if (isMobile(testInfo)) {
        await page.getByTestId('layout-mobile-menu-toggle').click()
        await page.getByTestId('layout-mobile-menu-catalog').click()
      } else {
        await page.getByTestId('layout-category-menu-toggle').click()
        const menu = page.getByTestId('layout-category-menu')
        await linkTo(menu, 'layout-category-link', '/catalogue/plantes-interieur').hover()
      }
      await expectNoViolation(page)
    })
  })
}
