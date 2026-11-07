import type { ResponsiveImage } from '@/shared/ui/kit'

export declare namespace Carousel {
  interface Slide {
    id: string
    title: string
    text: string
    image: ResponsiveImage | null
  }
}
