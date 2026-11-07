import { expect, test } from '@playwright/test'

import { gotoHydrated } from '../support/page'

test.describe('Accueil', () => {
  test('le hero porte le h1, les deux CTA et une image LCP prioritaire', async ({ page }) => {
    await gotoHydrated(page, '/')
    const hero = page.getByTestId('home-hero')
    await expect(hero.getByRole('heading', { level: 1 })).toHaveText('Boilerplate Nuxt')
    await expect(page.getByTestId('home-tasks-link')).toHaveAttribute('href', '/taches')
    await expect(page.getByTestId('home-contact-link')).toHaveAttribute('href', '/contact')

    const image = hero.locator('img')
    await expect(image).toHaveAttribute('fetchpriority', 'high')
    await expect(image).not.toHaveAttribute('loading', 'lazy')
    await expect(image).toHaveAttribute('alt', '')
  })

  test('affiche trois articles rendus côté serveur', async ({ page }) => {
    await gotoHydrated(page, '/')
    await expect(page.getByTestId('home-blog-card')).toHaveCount(3)
    await expect(page.getByTestId('home-blog-card').first().locator('time')).toHaveAttribute(
      'datetime',
      /^\d{4}-\d{2}-\d{2}$/,
    )
  })
  test('affiche les illustrations des articles servies par l’API', async ({ page }) => {
    await gotoHydrated(page, '/')
    const image = page.getByTestId('home-blog-card').first().locator('img')
    await image.scrollIntoViewIfNeeded()
    const apiOrigin = new URL(process.env.NUXT_PUBLIC_API_URL ?? 'http://localhost:8090').origin
    await expect(image).toHaveAttribute('src', new RegExp(`^${apiOrigin}/media/`))
    await expect
      .poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth))
      .toBeGreaterThan(0)
  })
})

test.describe('Carrousel', () => {
  test('suivant fait avancer, précédent est désactivé au début', async ({ page }) => {
    await gotoHydrated(page, '/')
    const carousel = page.getByTestId('home-carousel')
    const prev = carousel.getByTestId('carousel-prev')
    await expect(prev).toBeDisabled()

    await carousel.getByTestId('carousel-next').click()
    await expect(prev).toBeEnabled()
    await expect(carousel.getByTestId('carousel-dot').nth(1)).toHaveAttribute(
      'aria-current',
      'true',
    )
  })

  test('glisser à la souris fait avancer', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Le glisser souris se vérifie sur desktop')
    await gotoHydrated(page, '/')
    const track = page.getByTestId('carousel-track')
    await track.scrollIntoViewIfNeeded()
    const box = await track.boundingBox()
    if (!box) throw new Error('Piste du carrousel introuvable')

    const y = box.y + box.height / 3
    await page.mouse.move(box.x + box.width * 0.8, y)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width * 0.5, y, { steps: 10 })
    await page.mouse.move(box.x + box.width * 0.2, y, { steps: 10 })
    await page.mouse.up()

    await expect(page.getByTestId('carousel-prev')).toBeEnabled()
  })
})

test.describe('Carrousel sans JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('la piste défile nativement', async ({ page }) => {
    await page.goto('/')
    const viewport = page.getByTestId('carousel-track').locator('..')
    const scrolled = await viewport.evaluate((element) => {
      element.scrollLeft = element.clientWidth
      return element.scrollLeft
    })
    expect(scrolled).toBeGreaterThan(0)
  })
})
