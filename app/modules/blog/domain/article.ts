import type { ResponsiveImage } from '@/shared/ui/kit'

export declare namespace Article {
  type Id = string

  interface Entity {
    id: Id
    title: string
    excerpt: string
    publishedAt: string
    image: ResponsiveImage | null
  }
}
