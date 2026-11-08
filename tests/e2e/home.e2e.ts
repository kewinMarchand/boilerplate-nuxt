import { expect, test } from '@playwright/test'

import { gotoHydrated } from '../support/page'

import type { Page } from '@playwright/test'

const blogCardBoxes = async (page: Page) => {
  const cards = page.getByTestId('home-blog-card')
  await expect(cards).toHaveCount(3)
  const boxOf = async (index: number) => {
    const box = await cards.nth(index).boundingBox()
    if (!box) throw new Error(`Carte ${index} introuvable`)
    return box
  }
  return Promise.all([boxOf(0), boxOf(1), boxOf(2)])
}

test.describe('Accueil', () => {
  test('le hero porte le h1, les deux CTA et une image LCP prioritaire', async ({ page }) => {
    await gotoHydrated(page, '/')
    const hero = page.getByTestId('home-hero')
    await expect(hero.getByRole('heading', { level: 1 })).toHaveText('Boilerplate')
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

test.describe('Grille des articles', () => {
  test('l’image de la une a son propre sizes, les autres celui des petites cartes', async ({
    page,
  }) => {
    await gotoHydrated(page, '/')
    const cards = page.getByTestId('home-blog-card')
    await expect(cards.first().locator('source').first()).toHaveAttribute(
      'sizes',
      '(min-width: 1024px) 66vw, 100vw',
    )
    await expect(cards.nth(1).locator('source').first()).toHaveAttribute(
      'sizes',
      '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw',
    )
  })

  test.describe('largeurs fixées', () => {
    test.skip(({ isMobile }) => isMobile, 'Largeurs fixées dans le test, un seul projet suffit')

    test('desktop : la une sur 8 colonnes, les deux autres empilées à droite', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 })
      await gotoHydrated(page, '/')
      const [featured, second, third] = await blogCardBoxes(page)
      expect(featured.width / second.width).toBeGreaterThan(1.8)
      expect(featured.width / second.width).toBeLessThan(2.2)
      expect(third.x).toBeCloseTo(second.x, 0)
      expect(third.width).toBeCloseTo(second.width, 0)
      expect(second.x).toBeGreaterThan(featured.x + featured.width)
      expect(third.y).toBeGreaterThanOrEqual(second.y + second.height)
    })

    test('tablette : la une et les autres de même largeur, côte à côte', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 900 })
      await gotoHydrated(page, '/')
      const [featured, second, third] = await blogCardBoxes(page)
      expect(featured.width).toBeCloseTo(second.width, 0)
      expect(second.x).toBeGreaterThan(featured.x + featured.width)
      expect(second.y).toBeCloseTo(featured.y, 0)
      expect(third.x).toBeCloseTo(second.x, 0)
      expect(third.y).toBeGreaterThanOrEqual(second.y + second.height)
    })
  })

  test('mobile : les trois de même largeur, empilées', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Largeur du projet mobile')
    await gotoHydrated(page, '/')
    const [featured, second, third] = await blogCardBoxes(page)
    expect(second.width).toBeCloseTo(featured.width, 0)
    expect(third.width).toBeCloseTo(featured.width, 0)
    expect(second.x).toBeCloseTo(featured.x, 0)
    expect(second.y).toBeGreaterThanOrEqual(featured.y + featured.height)
    expect(third.y).toBeGreaterThanOrEqual(second.y + second.height)
  })
})

test.describe('Carrousel', () => {
  test('les diapositives débordent du conteneur sans défilement de la page', async ({ page }) => {
    await gotoHydrated(page, '/')
    const carousel = page.getByTestId('home-carousel')
    await carousel.scrollIntoViewIfNeeded()
    await expect(carousel.getByTestId('carousel-dot').first()).toBeVisible()
    const section = await carousel.boundingBox()
    if (!section) throw new Error('Carrousel introuvable')
    const slideRights = await carousel
      .getByTestId('carousel-slide')
      .evaluateAll((slides) => slides.map((slide) => slide.getBoundingClientRect().right))
    expect(Math.max(...slideRights)).toBeGreaterThan(section.x + section.width)
    const firstSlide = await carousel.getByTestId('carousel-slide').first().boundingBox()
    if (!firstSlide) throw new Error('Diapositive introuvable')
    // Visible et pas seulement présente : le point juste à droite du conteneur tombe sur une diapositive
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
    // Le geste part d'une diapositive cliquable : il fait défiler sans ouvrir la fiche
    await expect(page).toHaveURL('/')
  })

  test('une diapositive ouvre la fiche de son produit', async ({ page }) => {
    await gotoHydrated(page, '/')
    const link = page.getByTestId('carousel-slide-link').first()
    await link.scrollIntoViewIfNeeded()
    const name = ((await link.textContent()) ?? '').trim()
    await page.getByTestId('carousel-slide').first().click()

    await expect(page).toHaveURL(/\/produit\/[a-z0-9-]+$/)
    await expect(page.getByTestId('product-title')).toHaveText(name)
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
