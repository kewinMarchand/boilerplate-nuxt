import { BRAND_COLOR_KEYS } from '../domain/siteIdentity'

import type { SiteIdentity } from '../domain/siteIdentity'

const NOT_ENHANCED = ':not([data-a11y-mode="enhanced"])'

const declarations = (palette: SiteIdentity.Palette) =>
  BRAND_COLOR_KEYS.map((key) => `--bui-color-${key}:${palette[key]}`).join(';')

/**
 * Jetons de marque redéfinis sous les sélecteurs du clair et du sombre de boilerplates-ui, jamais en
 * mode renforcé. `:root` en tête relève la spécificité au-dessus de la bibliothèque, quel que soit
 * l'ordre des feuilles dans le `<head>`.
 */
export const themeCss = (theme: SiteIdentity.Theme) =>
  [
    `:root${NOT_ENHANCED}{${declarations(theme.light)}}`,
    `:root[data-color-scheme="dark"]${NOT_ENHANCED}{${declarations(theme.dark)}}`,
    `@media (prefers-color-scheme: dark){:root[data-color-scheme="auto"]${NOT_ENHANCED}{${declarations(theme.dark)}}}`,
  ].join('\n')
