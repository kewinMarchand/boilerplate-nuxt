import type { ResponsiveImage } from '@/shared/ui/kit'

export declare namespace Carousel {
  interface Slide {
    id: string
    title: string
    text: string
    image: ResponsiveImage | null
    /** Destination de la diapositive : son titre devient un lien étiré sur toute la diapositive. */
    href?: string
  }
}
