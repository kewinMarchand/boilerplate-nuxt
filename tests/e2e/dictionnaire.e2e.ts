import { expect, test } from '@playwright/test'

import { fr } from '@/shared/i18n/dictionaries/fr'

import { gotoHydrated, isMobile, linkTo } from '../support/page'

test.describe('Dictionnaire envoyé au navigateur', () => {
  test('le payload ne porte que les sections du document et de la page', async ({ request }) => {
    const html = await (await request.get('/contact')).text()

    expect(html).toContain(fr.contact.sendError)
    expect(html).toContain(fr.meta.contact.description)
    expect(html).toContain(fr.errors.serverIntro)
    expect(html).not.toContain(fr.maintenance.text)
    expect(html).not.toContain(fr.meta.legalNotice.description)
    expect(html).not.toContain(fr.catalog.applyFilters)
    expect(html).not.toContain(fr.legal.audienceText)
  })

  test('une navigation dans le navigateur demande les sections qui manquent à la page', async ({
    page,
  }, testInfo) => {
    await gotoHydrated(page, '/produit/monstera-deliciosa')
    const sections = page.waitForRequest((request) => request.url().includes('/api/dictionary'))
    if (isMobile(testInfo)) {
      await page.getByTestId('layout-mobile-menu-toggle').click()
      await linkTo(page, 'layout-mobile-menu-link', '/contact').click()
    } else {
      await linkTo(page, 'layout-nav-link', '/contact').click()
    }

    expect(new URL((await sections).url()).searchParams.get('sections')).toBe(
      'contact,meta.contact',
    )
    await expect(page).toHaveURL(/\/contact$/)
    await expect(page.getByTestId('contact-name')).toHaveAccessibleName(
      `${fr.contact.name} ${fr.ui.required}`,
    )
    await expect(page).toHaveTitle(new RegExp(`^${fr.meta.contact.title}`))
  })
})
