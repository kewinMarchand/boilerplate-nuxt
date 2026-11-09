import { toSiteIdentity } from './siteIdentityTranslation'

const PALETTE = {
  primary: '#c2410c',
  'primary-dark': '#923109',
  'on-primary': '#ffffff',
  'primary-surface-subtle': '#faf0ec',
  'primary-surface': '#f4ddd3',
  'primary-surface-strong': '#ebc2b1',
  secondary: '#0f766e',
  'secondary-dark': '#0b5852',
  'on-secondary': '#ffffff',
  'secondary-surface-subtle': '#ecf4f3',
  'secondary-surface': '#d4e6e5',
  'secondary-surface-strong': '#b2d3d1',
}

const LOGO = {
  alt: 'Oraki',
  width: 400,
  height: 120,
  sources: [{ type: 'image/webp' as const, srcset: 'https://api.test/logo-200.webp 200w' }],
  src: 'https://api.test/logo-200.webp',
}

const BASE = {
  name: 'Oraki',
  tagline: 'Plantes rares et tropicales, livrées chez vous.',
  logo: null,
  shareImage: null,
  icon: null,
  defaultColorScheme: 'auto' as const,
  theme: null,
  salesEnabled: true,
  locales: ['fr'],
}

describe('toSiteIdentity', () => {
  it('garde nom, accroche et thème par défaut, sans logo ni couleurs', () => {
    expect(toSiteIdentity(BASE)).toEqual(BASE)
  })

  it('garde le logo et les deux palettes', () => {
    const dark = { ...PALETTE, primary: '#da8d6d', 'on-primary': '#0f141d' }
    expect(
      toSiteIdentity({
        ...BASE,
        logo: LOGO,
        defaultColorScheme: 'dark',
        theme: { light: PALETTE, dark },
      }),
    ).toEqual({ ...BASE, logo: LOGO, defaultColorScheme: 'dark', theme: { light: PALETTE, dark } })
  })

  it('garde l’image de partage et les adresses de l’icône', () => {
    const icon = {
      png32: 'https://api.test/icon-32.png',
      png180: 'https://api.test/icon-180.png',
      png192: 'https://api.test/icon-192.png',
      png512: 'https://api.test/icon-512.png',
    }
    expect(toSiteIdentity({ ...BASE, shareImage: LOGO, icon })).toEqual({
      ...BASE,
      shareImage: LOGO,
      icon,
    })
  })

  it('garde la vente en ligne coupée', () => {
    expect(toSiteIdentity({ ...BASE, salesEnabled: false })).toEqual({
      ...BASE,
      salesEnabled: false,
    })
  })

  it('garde les langues dans leur ordre, la langue par défaut en premier', () => {
    expect(toSiteIdentity({ ...BASE, locales: ['en', 'fr'] }).locales).toEqual(['en', 'fr'])
  })

  it('tient le site pour monolingue en français sans langues dans la réponse', () => {
    const { locales: _, ...withoutLocales } = BASE
    // Réponse d'une API antérieure aux langues, hors du contrat généré
    expect(toSiteIdentity(withoutLocales as typeof BASE).locales).toEqual(['fr'])
  })

  it('refuse une couleur hors du format #rrggbb', () => {
    const light = { ...PALETTE, primary: 'red;}body{display:none' }
    expect(() => toSiteIdentity({ ...BASE, theme: { light, dark: PALETTE } })).toThrow(
      'Couleur primary invalide',
    )
  })
})
