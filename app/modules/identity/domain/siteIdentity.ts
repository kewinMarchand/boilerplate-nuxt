import type { ColorScheme } from '@/shared/ui/color-scheme/colorSchemeBootScript'
import type { ResponsiveImage } from '@/shared/ui/kit'

export const BRAND_COLOR_KEYS = [
  'primary',
  'primary-dark',
  'on-primary',
  'primary-surface-subtle',
  'primary-surface',
  'primary-surface-strong',
  'secondary',
  'secondary-dark',
  'on-secondary',
  'secondary-surface-subtle',
  'secondary-surface',
  'secondary-surface-strong',
] as const

export declare namespace SiteIdentity {
  type BrandColorKey = (typeof BRAND_COLOR_KEYS)[number]
  /** Couleurs `#rrggbb`, une par jeton de marque de boilerplates-ui. */
  type Palette = Record<BrandColorKey, string>

  interface Theme {
    light: Palette
    dark: Palette
  }

  interface Entity {
    name: string
    tagline: string
    logo: ResponsiveImage | null
    defaultColorScheme: ColorScheme
    /** `null` sans couleurs de marque saisies : les jetons de la bibliothèque restent tels quels. */
    theme: Theme | null
  }
}
