import { toArticle } from './articleTranslation'

const IMAGE = {
  alt: 'Heliconia en gros plan',
  width: 1280,
  height: 720,
  sources: [{ type: 'image/avif' as const, srcset: 'http://api.test/media/a-640.avif 640w' }],
  src: 'http://api.test/media/a-640.webp',
}

describe('toArticle', () => {
  it('garde le contenu et garde l’image de l’API telle quelle', () => {
    expect(
      toArticle({
        id: 2,
        slug: 'un-carrousel-accessible-sans-dependance',
        title: 'Un carrousel accessible sans dépendance',
        excerpt: 'Défilement natif, boutons explicites, pas de lecture automatique.',
        publishedAt: '2026-09-22',
        image: IMAGE,
      }),
    ).toEqual({
      id: '2',
      title: 'Un carrousel accessible sans dépendance',
      excerpt: 'Défilement natif, boutons explicites, pas de lecture automatique.',
      publishedAt: '2026-09-22',
      image: IMAGE,
    })
  })
})
