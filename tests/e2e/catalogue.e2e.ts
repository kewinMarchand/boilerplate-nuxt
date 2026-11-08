import { expect, test } from '@playwright/test'

import { gotoHydrated, isMobile } from '../support/page'

import type { Page, TestInfo } from '@playwright/test'

const openFilters = async (page: Page, testInfo: TestInfo) => {
  if (isMobile(testInfo)) await page.getByTestId('catalog-filters-open').click()
  return page.getByTestId('catalog-filters')
}

const prices = async (page: Page) =>
  (await page.getByTestId('catalog-product-price').allTextContents()).map((text) =>
    Number(text.replace(/[^\d,]/g, '').replace(',', '.')),
  )

test.describe('Catalogue', () => {
  test('filtrer par exposition met à jour l’URL, le compteur et les puces', async ({
    page,
  }, testInfo) => {
    await gotoHydrated(page, '/catalogue')
    await expect(page.getByTestId('catalog-active-filters')).toHaveCount(0)

    const filters = await openFilters(page, testInfo)
    const checkbox = filters.getByTestId('catalog-filter-exposure-mi-ombre')
    await checkbox.check()

    await expect(page).toHaveURL(/exposition=mi-ombre/)
    await expect(page.getByTestId('catalog-results-count')).toHaveText('7 produits')
    if (!isMobile(testInfo)) await expect(checkbox).toBeFocused()
    if (isMobile(testInfo)) await page.keyboard.press('Escape')
    await expect(page.getByTestId('catalog-active-filter')).toHaveText(/Mi-ombre/)
  })

  test('filtrer par un attribut configurable met à jour l’URL, le compteur et les puces', async ({
    page,
  }, testInfo) => {
    await gotoHydrated(page, '/catalogue?page=2')

    const filters = await openFilters(page, testInfo)
    const checkbox = filters.getByTestId('catalog-filter-attribute-feuillage-caduc')
    await expect(checkbox).toHaveAccessibleName(/Caduc \(2\)/)
    await checkbox.check()

    await expect(page).toHaveURL(/attr-feuillage=caduc/)
    await expect(page).not.toHaveURL(/page=/)
    await expect(page.getByTestId('catalog-results-count')).toHaveText('2 produits')
    if (isMobile(testInfo)) await page.keyboard.press('Escape')
    await expect(page.getByTestId('catalog-active-filter')).toHaveText(/Feuillage : Caduc/)

    await page.getByTestId('catalog-clear-filters').click()
    await expect(page).not.toHaveURL(/attr-feuillage/)
    await expect(page.getByTestId('catalog-active-filters')).toHaveCount(0)
  })

  test('n’affiche pas de facette d’attribut dans une branche sans attribut', async ({
    page,
  }, testInfo) => {
    await gotoHydrated(page, '/catalogue/plantes-exterieur/arbustes-a-fleurs')

    const filters = await openFilters(page, testInfo)
    await expect(filters.getByTestId('catalog-filter-exposure-soleil')).toBeVisible()
    await expect(filters.locator('[data-testid^="catalog-filter-attribute-"]')).toHaveCount(0)
  })

  test('retirer une puce et tout effacer', async ({ page }) => {
    await gotoHydrated(page, '/catalogue?exposition=soleil&taille=M&tri=nom&vue=liste')
    await expect(page.getByTestId('catalog-active-filter')).toHaveCount(2)

    await page.getByTestId('catalog-active-filter').first().click()
    await expect(page).not.toHaveURL(/exposition=/)
    await expect(page.getByTestId('catalog-active-filter')).toHaveCount(1)

    await page.getByTestId('catalog-clear-filters').click()
    await expect(page).toHaveURL(/\/catalogue\?vue=liste$/)
    await expect(page.getByTestId('catalog-active-filters')).toHaveCount(0)
    await expect(page.getByRole('heading', { level: 1 })).toBeFocused()
  })

  test('trier par prix croissant', async ({ page }) => {
    await gotoHydrated(page, '/catalogue')
    await page.getByTestId('catalog-sort').selectOption('prix-asc')

    await expect(page).toHaveURL(/tri=prix-asc/)
    await expect.poll(async () => (await prices(page)).slice(0, 2)).toEqual([12.9, 14.9])
  })

  test('paginer vers la page 2 puis revenir', async ({ page }) => {
    await gotoHydrated(page, '/catalogue')
    const pagination = page.getByTestId('catalog-pagination')

    await pagination.getByTestId('catalog-pagination-page-2').click()
    await expect(page).toHaveURL(/page=2/)
    await expect(pagination.locator('span[aria-current="page"]')).toHaveText(/2/)
    await expect(page.getByRole('heading', { level: 1 })).toBeFocused()

    await pagination.getByTestId('catalog-pagination-prev').click()
    await expect(page).not.toHaveURL(/page=/)
    await expect(pagination.locator('span[aria-current="page"]')).toHaveText(/1/)
  })

  test('la vue liste persiste lors d’un filtrage', async ({ page }, testInfo) => {
    await gotoHydrated(page, '/catalogue')
    await page.getByTestId('catalog-view-list').click()
    await expect(page).toHaveURL(/vue=liste/)
    await expect(page.getByTestId('catalog-view-list')).toHaveAttribute('aria-current', 'page')

    const filters = await openFilters(page, testInfo)
    await filters.getByTestId('catalog-filter-in-stock').check()
    await expect(page).toHaveURL(/en_stock=1/)
    await expect(page).toHaveURL(/vue=liste/)
  })

  test('affiche l’état vide avec un bouton pour tout effacer', async ({ page }) => {
    await gotoHydrated(page, '/catalogue/plantes-aquatiques?exposition=ombre')
    await expect(page.getByTestId('catalog-empty')).toBeVisible()
    await expect(page.getByTestId('catalog-product')).toHaveCount(0)
  })

  test('n’affiche pas l’état vide quand des produits correspondent', async ({ page }) => {
    await gotoHydrated(page, '/catalogue/plantes-aquatiques')
    await expect(page.getByTestId('catalog-product')).toHaveCount(3)
    await expect(page.getByTestId('catalog-empty')).toHaveCount(0)
  })
})

test.describe('Panneau de filtres mobile', () => {
  test.skip(({ isMobile }) => !isMobile, 'Panneau réservé aux petits écrans')

  test('s’ouvre, se ferme avec Échap et rend le focus au bouton', async ({ page }) => {
    await gotoHydrated(page, '/catalogue')
    const opener = page.getByTestId('catalog-filters-open')
    await expect(opener).toHaveAttribute('aria-expanded', 'false')

    await opener.click()
    await expect(page.getByTestId('catalog-filters')).toBeVisible()
    await expect(opener).toHaveAttribute('aria-expanded', 'true')

    await page.keyboard.press('Escape')
    await expect(page.getByTestId('catalog-filters')).toHaveCount(0)
    await expect(opener).toBeFocused()
  })
})

test.describe('Catalogue sans JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('le formulaire GET applique les filtres', async ({ page }) => {
    await page.goto('/catalogue?vue=liste')
    const filters = page.getByTestId('catalog-filters')
    await filters.getByTestId('catalog-filter-size-L').check()
    await filters.getByTestId('catalog-filters-apply').click()

    await expect(page).toHaveURL(/taille=L/)
    await expect(page).toHaveURL(/vue=liste/)
    await expect(page.getByTestId('catalog-results-count')).toHaveText('9 produits')
  })

  test('le formulaire GET applique un attribut configurable', async ({ page }) => {
    await page.goto('/catalogue')
    const filters = page.getByTestId('catalog-filters')
    await filters.getByTestId('catalog-filter-attribute-feuillage-persistant').check()
    await filters.getByTestId('catalog-filters-apply').click()

    await expect(page).toHaveURL(/attr-feuillage=persistant/)
    await expect(page.getByTestId('catalog-results-count')).toHaveText('6 produits')
  })
})

test.describe('Catalogue, API en erreur (X-Scenario: error)', () => {
  test.use({ extraHTTPHeaders: { 'X-Scenario': 'error' } })

  test('affiche l’erreur et la relance', async ({ page }) => {
    await page.goto('/catalogue')

    await expect(page.getByTestId('catalog-error')).toBeVisible()
    await expect(page.getByTestId('catalog-retry')).toBeVisible()
    await expect(page.getByTestId('catalog-product')).toHaveCount(0)
  })
})

test.describe('Catalogue, API sans données (X-Scenario: empty)', () => {
  test.use({ extraHTTPHeaders: { 'X-Scenario': 'empty' } })

  test('affiche le message de liste vide', async ({ page }) => {
    await page.goto('/catalogue')

    await expect(page.getByTestId('catalog-empty')).toBeVisible()
    await expect(page.getByTestId('catalog-error')).toHaveCount(0)
  })
})
