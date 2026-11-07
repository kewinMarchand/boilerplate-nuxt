import type { ResponsiveImage } from '@/shared/ui/kit'

export declare namespace Article {
  type Id = string

  interface Entity {
    id: Id
    slug: string
    title: string
    excerpt: string
    publishedAt: string
    image: ResponsiveImage | null
  }

  /** Fiche : l'article et son texte en HTML, converti par l'API depuis le Markdown saisi dans l'admin. */
  interface Detail extends Entity {
    html: string
  }
}

export const articleHref = (slug: string) => `/blog/${slug}`
