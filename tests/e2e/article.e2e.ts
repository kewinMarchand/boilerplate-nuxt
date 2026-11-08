import { expect, test } from '@playwright/test'

import { gotoHydrated } from '../support/page'

const ARTICLE = '/blog/un-carrousel-accessible-sans-dependance'
const API_URL = process.env.NUXT_PUBLIC_API_URL ?? 'http://localhost:8090'

test.describe('Fiche article', () => {
  test('s’ouvre depuis une carte de l’accueil', async ({ page }) => {
    await gotoHydrated(page, '/')

    const card = page.getByTestId('home-blog-card').first()
    const title = (await card.locator('h3').textContent()) ?? ''
    await card.getByRole('link').click()

    await expect(page).toHaveURL(/\/blog\/[a-z0-9-]+$/)
    await expect(page.getByTestId('article-title')).toHaveText(title)
  })

  test('affiche le titre, la date, l’image de l’API et le texte rendu côté serveur', async ({
    page,
    request,
  }) => {
    const html = await (await request.get(ARTICLE)).text()
    expect(html).toContain('<h2>Partir du défilement natif</h2>')

    await page.goto(ARTICLE)
    await expect(page.getByTestId('article-title')).toHaveText(
      'Un carrousel accessible sans dépendance',
    )
    await expect(page.getByTestId('article-page').locator('time')).toHaveAttribute(
      'datetime',
      '2026-09-22',
    )
    await expect(page.getByTestId('article-body').locator('li')).toHaveCount(3)
    const image = page.getByTestId('article-page').locator('img').first()
    await expect(image).toHaveAttribute('fetchpriority', 'high')
    await expect
      .poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth))
      .toBeGreaterThan(0)
    await expect(page.getByTestId('layout-breadcrumb')).toContainText(
      'Un carrousel accessible sans dépendance',
    )
  })

  test('son fil d’Ariane mène à la liste des articles', async ({ page }) => {
    await gotoHydrated(page, ARTICLE)

    const breadcrumb = page.getByTestId('layout-breadcrumb')
    await expect(breadcrumb.locator('li')).toHaveCount(3)
    await breadcrumb.locator('a[href="/blog"]').click()

    await expect(page).toHaveURL(/\/blog$/)
    await expect(page.getByTestId('blog-list')).toBeVisible()
  })

  test('son lien « Tous les articles » mène à la liste', async ({ page }) => {
    await gotoHydrated(page, ARTICLE)

    await page.getByTestId('article-blog-link').click()

    await expect(page).toHaveURL(/\/blog$/)
    await expect(page.getByTestId('blog-list')).toBeVisible()
  })

  test('expose ses données structurées d’article', async ({ page }) => {
    await page.goto(ARTICLE)

    expect(await page.locator('meta[property="og:type"]').getAttribute('content')).toBe('article')
    const types = (await page.locator('script[type="application/ld+json"]').allTextContents()).map(
      (text) => (JSON.parse(text) as { '@type': string })['@type'],
    )
    expect(types).toEqual(expect.arrayContaining(['BlogPosting', 'BreadcrumbList']))
  })

  test('répond 404 pour un article inconnu', async ({ page }) => {
    const response = await page.goto('/blog/article-inconnu')

    expect(response?.status()).toBe(404)
  })
})

test.describe('Rubrique, format et audio de la fiche article', () => {
  test('lecteur audio sans autolecture, avec durée et intervenant', async ({ page, request }) => {
    const { audio, speaker } = (await (
      await request.get(`${API_URL}/api/articles/un-carrousel-accessible-sans-dependance`)
    ).json()) as { audio: { src: string; durationSeconds: number }; speaker: string }
    await gotoHydrated(page, ARTICLE)

    const player = page.getByTestId('article-audio')
    await expect(player).toHaveAttribute('controls', '')
    await expect(player).toHaveAttribute('preload', 'none')
    await expect(player).not.toHaveAttribute('autoplay')
    await expect(player.locator('source')).toHaveAttribute('src', audio.src)
    expect(await player.evaluate((element: HTMLAudioElement) => element.paused)).toBe(true)
    const block = page.getByTestId('article-audio-block')
    await expect(block).toContainText(`${audio.durationSeconds} s`)
    await expect(page.getByTestId('article-speaker')).toHaveText(speaker)
  })

  test('rubrique et format sous le titre', async ({ page }) => {
    await page.goto('/blog/pourquoi-rendre-le-contenu-cote-serveur')

    const article = page.getByTestId('article-page')
    await expect(article.getByTestId('article-section')).toHaveText('Conseils')
    await expect(article.getByTestId('article-format')).toHaveText('Guide')
    await expect(page.getByTestId('article-audio')).toHaveCount(0)
  })

  test('sans audio ni format : ni lecteur ni format', async ({ page }) => {
    await page.goto('/blog/le-mode-accessibilite-renforcee')

    await expect(page.getByTestId('article-title')).toBeVisible()
    await expect(page.getByTestId('article-section')).toHaveText('Actualités')
    await expect(page.getByTestId('article-format')).toHaveCount(0)
    await expect(page.getByTestId('article-audio-block')).toHaveCount(0)
    await expect(page.getByTestId('article-audio')).toHaveCount(0)
  })
})
