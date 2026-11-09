import type { LanguageAlternate } from '@/shared/i18n'
import type { ResponsiveImage } from '@/shared/ui/kit'

export declare namespace Article {
  type Id = string

  /** Rubrique ou format, administrés dans l'API. */
  interface Term {
    slug: string
    name: string
  }

  interface Audio {
    src: string
    type: string
    durationSeconds: number
  }

  interface Entity {
    id: Id
    slug: string
    title: string
    excerpt: string
    publishedAt: string
    image: ResponsiveImage | null
    section: Term | null
    format: Term | null
    audio: Audio | null
    /** Vide si aucun intervenant n'est saisi. */
    speaker: string
  }

  /** Fiche : l'article et son texte en HTML, converti par l'API depuis le Markdown saisi dans l'admin. */
  interface Detail extends Entity {
    html: string
    /** Vides si non saisis : la fiche garde son titre et son extrait. */
    metaTitle: string
    metaDescription: string
    /** Slug de l'article dans chaque langue activée (vide sur un site monolingue). */
    alternates: { locale: string; slug: string }[]
  }
}

export const articleHref = (slug: string) => `/blog/${slug}`

/** L'article dans chaque langue où il a un slug (`alternates` de l'API). */
export const articleAlternates = (article: Article.Detail): LanguageAlternate[] =>
  article.alternates.map(({ locale, slug }) => ({ locale, path: articleHref(slug) }))
