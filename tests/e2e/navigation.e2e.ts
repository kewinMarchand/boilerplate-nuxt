import { expect, test } from '@playwright/test'

import { gotoHydrated, isMobile, linkTo } from '../support/page'

test.describe('Navigation', () => {
  test('le lien actif porte aria-current', async ({ page }, testInfo) => {
    await gotoHydrated(page, '/contact')
    const testId = isMobile(testInfo) ? 'layout-mobile-menu-link' : 'layout-nav-link'
    if (isMobile(testInfo)) await page.getByTestId('layout-mobile-menu-toggle').click()

    await expect(linkTo(page, testId, '/contact')).toHaveAttribute('aria-current', 'page')
    await expect(linkTo(page, testId, '/')).not.toHaveAttribute('aria-current')
  })

  test('le lien Blog suit le menu Catalogue et devient actif sur /blog', async ({
    page,
  }, testInfo) => {
    await gotoHydrated(page, '/blog')
    if (isMobile(testInfo)) {
      await page.getByTestId('layout-mobile-menu-toggle').click()
      await expect(linkTo(page, 'layout-mobile-menu-link', '/blog')).toHaveAttribute(
        'aria-current',
        'page',
      )
      return
    }

    const blogLink = linkTo(page, 'layout-nav-link', '/blog')
    await expect(blogLink).toHaveAttribute('aria-current', 'page')
    const follows = await page
      .getByTestId('layout-category-menu-toggle')
      .evaluate(
        (toggle, link) =>
          !!link && !!(toggle.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING),
        await blogLink.elementHandle(),
      )
    expect(follows).toBe(true)
  })

  test('le lien d’évitement mène au contenu principal', async ({ page }) => {
    await gotoHydrated(page, '/')
    await page.keyboard.press('Tab')

    const skipLink = page.getByTestId('layout-skip-link')
    await expect(skipLink).toBeFocused()
    await skipLink.press('Enter')
    await expect(page).toHaveURL(/#main$/)
  })
})

test.describe('Mode accessibilité renforcée', () => {
  test('s’active, persiste au rechargement et se désactive', async ({ page }) => {
    await gotoHydrated(page, '/')
    const html = page.locator('html')
    const toggle = page.getByTestId('a11y-mode-toggle')

    await expect(html).not.toHaveAttribute('data-a11y-mode')
    await expect(toggle).toHaveAttribute('aria-pressed', 'false')

    await toggle.click()
    await expect(html).toHaveAttribute('data-a11y-mode', 'enhanced')
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')

    await page.reload()
    await expect(html).toHaveAttribute('data-a11y-mode', 'enhanced')
    await expect(page.getByTestId('a11y-mode-toggle')).toHaveAttribute('aria-pressed', 'true')

    await page.getByTestId('a11y-mode-toggle').click()
    await expect(html).not.toHaveAttribute('data-a11y-mode')
    await page.reload()
    await expect(html).not.toHaveAttribute('data-a11y-mode')
  })
})
