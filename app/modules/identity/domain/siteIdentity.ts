import type { ColorScheme } from '@/shared/ui/color-scheme/colorSchemeBootScript'
import type { ResponsiveImage } from '@/shared/ui/kit'

/** Langues d'un site dont l'API ne les donne pas (contrat antérieur aux langues) : le français seul. */
export const DEFAULT_LOCALES = ['fr']

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

  /** PNG carrés tirés par l'API de l'icône saisie, adresses absolues. */
  interface Icon {
    png32: string
    png180: string
    png192: string
    png512: string
  }

  interface Entity {
    name: string
    tagline: string
    logo: ResponsiveImage | null
    /** Image de partage par défaut (`og:image`), 1200 × 630. */
    shareImage: ResponsiveImage | null
    /** `null` sans icône saisie : favicons du front. */
    icon: Icon | null
    defaultColorScheme: ColorScheme
    /** `null` sans couleurs de marque saisies : les jetons de la bibliothèque restent tels quels. */
    theme: Theme | null
    /** `false` : ni prix ni panier, une demande de renseignement sur chaque produit. */
    salesEnabled: boolean
    /** Langues du site (codes BCP 47 courts), la première étant la langue par défaut. */
    locales: string[]
  }
}
