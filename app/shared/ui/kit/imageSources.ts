/** Forme de l'objet `image` du contrat de l'API : variantes AVIF puis WebP, adresses prêtes à poser. */
export interface ResponsiveImage {
  alt: string
  width: number
  height: number
  sources: { type: string; srcset: string }[]
  src: string
}

const FORMATS = ['avif', 'webp'] as const

export const buildSrcset = (base: string, widths: number[], format: string) =>
  widths.map((width) => `/images/${base}-${width}.${format} ${width}w`).join(', ')

export const buildSources = (base: string, widths: number[]) =>
  FORMATS.map((format) => ({ type: `image/${format}`, srcset: buildSrcset(base, widths, format) }))
