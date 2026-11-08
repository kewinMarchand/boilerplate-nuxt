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
  defaultColorScheme: 'auto' as const,
  theme: null,
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

  it('refuse une couleur hors du format #rrggbb', () => {
    const light = { ...PALETTE, primary: 'red;}body{display:none' }
    expect(() => toSiteIdentity({ ...BASE, theme: { light, dark: PALETTE } })).toThrow(
      'Couleur primary invalide',
    )
  })
})
