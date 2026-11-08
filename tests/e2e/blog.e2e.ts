import { expect, test } from '@playwright/test'

import { gotoHydrated, linkTo } from '../support/page'

const API_URL = process.env.NUXT_PUBLIC_API_URL ?? 'http://localhost:8090'

test.describe('Liste des articles', () => {
  test('affiche les articles de l’API, rendus côté serveur, sous le fil d’Ariane', async ({
    page,
    request,
  }) => {
    const articles = (await (await request.get(`${API_URL}/api/articles`)).json()) as {
      slug: string
    }[]
    const html = await (await request.get('/blog')).text()
    expect(html).toContain('data-testid="blog-list"')

    await gotoHydrated(page, '/blog')

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Blog')
    const cards = page.getByTestId('blog-card')
    await expect(cards).toHaveCount(articles.length)
    await expect(cards.first().getByRole('link')).toHaveAttribute(
      'href',
      `/blog/${articles[0]?.slug}`,
    )
    await expect(cards.first().locator('time')).toHaveAttribute('datetime', /^\d{4}-\d{2}-\d{2}$/)
    await expect(page.getByTestId('layout-breadcrumb').locator('li')).toHaveCount(2)
    await expect(page.getByTestId('layout-breadcrumb').locator('[aria-current="page"]')).toHaveText(
      'Blog',
    )
    await expect(page.getByTestId('blog-empty')).toHaveCount(0)
    await expect(page.getByTestId('blog-error')).toHaveCount(0)
  })

  test('une carte ouvre sa fiche', async ({ page }) => {
    await gotoHydrated(page, '/blog')

    const card = page.getByTestId('blog-card').first()
    const title = (await card.getByRole('heading', { level: 2 }).textContent()) ?? ''
    await card.getByRole('link').click()

    await expect(page).toHaveURL(/\/blog\/[a-z0-9-]+$/)
    await expect(page.getByTestId('article-title')).toHaveText(title)
  })

  test('expose ses données structurées de blog', async ({ page }) => {
    await page.goto('/blog')

    const types = (await page.locator('script[type="application/ld+json"]').allTextContents()).map(
      (text) => (JSON.parse(text) as { '@type': string })['@type'],
    )
    expect(types).toEqual(expect.arrayContaining(['Blog', 'BreadcrumbList']))
  })

  test('l’accueil mène à la liste par « Tous les articles »', async ({ page }) => {
    await gotoHydrated(page, '/')

    await page.getByTestId('home-blog-all').click()

    await expect(page).toHaveURL(/\/blog$/)
    await expect(page.getByTestId('blog-list')).toBeVisible()
  })
})

interface ApiArticle {
  slug: string
  section: { slug: string; name: string } | null
}

test.describe('Rubriques des articles', () => {
  test('la rubrique en sur-titre des cartes, sur /blog et à l’accueil', async ({
    page,
    request,
  }) => {
    const articles = (await (await request.get(`${API_URL}/api/articles`)).json()) as ApiArticle[]
    const withSection = articles.filter((article) => article.section)

    await page.goto('/blog')
    await expect(page.getByTestId('blog-list').getByTestId('article-section')).toHaveCount(
      withSection.length,
    )
    await expect(page.getByTestId('blog-card').first().getByTestId('article-section')).toHaveText(
      articles[0]?.section?.name ?? '',
    )

    await page.goto('/')
    await expect(
      page.getByTestId('home-blog-card').first().getByTestId('article-section'),
    ).toHaveText(articles[0]?.section?.name ?? '')
  })

  test('filtre par rubrique : liens, rubrique active et liste filtrée', async ({
    page,
    request,
  }) => {
    const sections = (await (await request.get(`${API_URL}/api/article-sections`)).json()) as {
      slug: string
    }[]
    const conseils = (await (
      await request.get(`${API_URL}/api/articles?section=conseils`)
    ).json()) as ApiArticle[]
    await gotoHydrated(page, '/blog')

    const nav = page.getByRole('navigation', { name: 'Rubriques' })
    await expect(nav.getByTestId('blog-section-link')).toHaveCount(sections.length + 1)
    await expect(linkTo(nav, 'blog-section-link', '/blog')).toHaveAttribute('aria-current', 'page')

    await linkTo(nav, 'blog-section-link', '/blog?rubrique=conseils').click()

    await expect(page).toHaveURL(/\/blog\?rubrique=conseils$/)
    await expect(linkTo(nav, 'blog-section-link', '/blog?rubrique=conseils')).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(linkTo(nav, 'blog-section-link', '/blog')).not.toHaveAttribute('aria-current')
    await expect(page.getByTestId('blog-card')).toHaveCount(conseils.length)
  })

  test.describe('sans JavaScript', () => {
    test.use({ javaScriptEnabled: false })

    test('la liste filtrée et la rubrique active sont rendues côté serveur', async ({ page }) => {
      await page.goto('/blog?rubrique=actualites')

      await expect(page.getByTestId('blog-card')).toHaveCount(1)
      await expect(page.getByTestId('blog-card').getByTestId('article-section')).toHaveText(
        'Actualités',
      )
      await expect(linkTo(page, 'blog-section-link', '/blog?rubrique=actualites')).toHaveAttribute(
        'aria-current',
        'page',
      )
    })
  })

  test('une rubrique inconnue donne la liste vide, sans rubrique active', async ({ page }) => {
    await page.goto('/blog?rubrique=inconnue')

    await expect(page.getByTestId('blog-empty')).toBeVisible()
    await expect(page.locator('[data-testid="blog-section-link"][aria-current]')).toHaveCount(0)
  })
})

test.describe('Liste des articles, API en erreur (X-Scenario: error)', () => {
  test.use({ extraHTTPHeaders: { 'X-Scenario': 'error' } })

  test('affiche l’erreur et la relance, sans liste', async ({ page }) => {
    await page.goto('/blog')

    await expect(page.getByTestId('blog-error')).toBeVisible()
    await expect(page.getByTestId('blog-retry')).toBeVisible()
    await expect(page.getByTestId('blog-list')).toHaveCount(0)
  })
})

test.describe('Liste des articles, API sans données (X-Scenario: empty)', () => {
  test.use({ extraHTTPHeaders: { 'X-Scenario': 'empty' } })

  test('affiche le message de liste vide', async ({ page }) => {
    await page.goto('/blog')

    await expect(page.getByTestId('blog-empty')).toBeVisible()
    await expect(page.getByTestId('blog-list')).toHaveCount(0)
  })

  test('sans rubrique, pas de filtre', async ({ page }) => {
    await page.goto('/blog')

    await expect(page.getByTestId('blog-empty')).toBeVisible()
    await expect(page.getByTestId('blog-sections')).toHaveCount(0)
  })
})
