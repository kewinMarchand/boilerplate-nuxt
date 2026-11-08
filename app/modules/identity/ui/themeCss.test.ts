import { BRAND_COLOR_KEYS } from '../domain/siteIdentity'
import { themeCss } from './themeCss'

import type { SiteIdentity } from '../domain/siteIdentity'

const palette = (color: string): SiteIdentity.Palette => ({
  primary: color,
  'primary-dark': color,
  'on-primary': color,
  'primary-surface-subtle': color,
  'primary-surface': color,
  'primary-surface-strong': color,
  secondary: color,
  'secondary-dark': color,
  'on-secondary': color,
  'secondary-surface-subtle': color,
  'secondary-surface': color,
  'secondary-surface-strong': color,
})

describe('themeCss', () => {
  const css = themeCss({ light: palette('#111111'), dark: palette('#eeeeee') })
  const [light, dark, auto] = css.split('\n')

  it('redéfinit les douze jetons du clair hors mode renforcé', () => {
    expect(light).toMatch(/^:root:not\(\[data-a11y-mode="enhanced"\]\)\{/)
    for (const key of BRAND_COLOR_KEYS) expect(light).toContain(`--bui-color-${key}:#111111`)
  })

  it('pose le sombre forcé et le sombre du système, jamais en mode renforcé', () => {
    expect(dark).toMatch(
      /^:root\[data-color-scheme="dark"\]:not\(\[data-a11y-mode="enhanced"\]\)\{--bui-color-primary:#eeeeee;/,
    )
    expect(auto).toMatch(
      /^@media \(prefers-color-scheme: dark\)\{:root\[data-color-scheme="auto"\]:not\(\[data-a11y-mode="enhanced"\]\)\{--bui-color-primary:#eeeeee;/,
    )
  })
})
