import { expect, test } from '@playwright/test'

import { ROUTES } from '../support/routes'

import type { Page } from '@playwright/test'

const API_URL = process.env.NUXT_PUBLIC_API_URL ?? 'http://localhost:8090'

test.describe('Métadonnées SEO rendues côté serveur', () => {
  test.use({ javaScriptEnabled: false })

  for (const route of ROUTES) {
    test(`la page ${route} porte ses métadonnées`, async ({ page }) => {
      await page.goto(route)

      const title = await page.title()
      expect(title.length).toBeGreaterThan(0)
      // Partie propre à la page, avant le nom du site : 60 caractères au plus, comme dans l'admin
      expect(title.split(' · ')[0]?.length ?? 0).toBeLessThanOrEqual(60)

      await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
      const description = await page.locator('meta[name="description"]').getAttribute('content')
      expect(description?.length ?? 0).toBeGreaterThanOrEqual(50)
      expect(description?.length ?? 0).toBeLessThanOrEqual(160)
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https?:\/\//)
      for (const property of ['og:title', 'og:description', 'og:image']) {
        await expect(page.locator(`meta[property="${property}"]`)).toHaveAttribute('content', /.+/)
      }
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
        'content',
        /^https?:\/\//,
      )

      for (const json of await page
        .locator('script[type="application/ld+json"]')
        .allTextContents()) {
        expect(() => JSON.parse(json)).not.toThrow()
      }
    })
  }

  test('chaque page a un titre unique', async ({ page }) => {
    const titles: string[] = []
    for (const route of ROUTES) {
      await page.goto(route)
      titles.push(await page.title())
    }
    expect(new Set(titles).size).toBe(ROUTES.length)
  })

  test('l’accueil déclare Organization et WebSite', async ({ page }) => {
    await page.goto('/')
    const types = (await page.locator('script[type="application/ld+json"]').allTextContents()).map(
      (json) => JSON.parse(json)['@type'],
    )
    expect(types).toEqual(expect.arrayContaining(['Organization', 'WebSite']))
  })
})

test.describe('Métadonnées administrables, valeurs de l’API ou valeurs du front', () => {
  test.use({ javaScriptEnabled: false })

  const description = (page: Page) =>
    page.locator('meta[name="description"]').getAttribute('content')

  test('la description saisie pour /blog remplace celle du front', async ({ page, request }) => {
    const metas = (await (await request.get(`${API_URL}/api/page-metas`)).json()) as {
      page: string
      description: string
    }[]
    const saisie = metas.find((meta) => meta.page === 'blog')?.description ?? ''
    expect(saisie).not.toBe('')

    await page.goto('/blog')

    expect(await description(page)).toBe(saisie)
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', saisie)
    await expect(page).toHaveTitle('Blog · Boilerplate')
  })

  test('sans métadonnée saisie, la page fixe garde son titre et sa description', async ({
    page,
  }) => {
    await page.goto('/contact')

    await expect(page).toHaveTitle('Contact · Boilerplate')
    expect(await description(page)).toMatch(/^Démo de formulaire/)
  })

  test('sans métadonnée saisie, produit et article gardent leurs valeurs calculées', async ({
    page,
  }) => {
    await page.goto('/produit/monstera-deliciosa')
    await expect(page).toHaveTitle('Monstera deliciosa · Boilerplate')
    expect(await description(page)).toMatch(/^Monstera deliciosa : exposition/)

    await page.goto('/blog/le-mode-accessibilite-renforcee')
    await expect(page).toHaveTitle('Le mode accessibilité renforcée · Boilerplate')
    expect(await description(page)).toMatch(/^Texte agrandi/)
  })

  test('sans image de partage saisie, og:image reste celle du front', async ({ page }) => {
    await page.goto('/mentions-legales')

    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      /\/og-image\.jpg$/,
    )
  })

  test('sans icône saisie, favicons et manifeste gardent les fichiers du front', async ({
    page,
    request,
  }) => {
    await page.goto('/')

    await expect(page.locator('link[rel="icon"][href="/favicon.svg"]')).toHaveCount(1)
    await expect(page.locator('link[rel="icon"][href="/favicon.ico"]')).toHaveCount(1)
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
      'href',
      '/apple-touch-icon.png',
    )
    await expect(page.locator('link[rel="icon"][type="image/png"]')).toHaveCount(0)
    const manifest = (await (await request.get('/manifest.webmanifest')).json()) as {
      icons: { src: string }[]
    }
    expect(manifest.icons.map((icon) => icon.src)).toEqual(['/icon-192.png', '/icon-512.png'])
  })
})
