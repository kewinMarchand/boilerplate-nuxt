import { toArticle, toArticleDetail } from './articleTranslation'

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
      slug: 'un-carrousel-accessible-sans-dependance',
      title: 'Un carrousel accessible sans dépendance',
      excerpt: 'Défilement natif, boutons explicites, pas de lecture automatique.',
      publishedAt: '2026-09-22',
      image: IMAGE,
    })
  })
})

describe('toArticleDetail', () => {
  it('ajoute le texte en HTML de la fiche', () => {
    expect(
      toArticleDetail({
        id: 3,
        slug: 'le-mode-accessibilite-renforcee',
        title: 'Le mode accessibilité renforcée',
        excerpt: '',
        publishedAt: '2026-10-01',
        image: null,
        html: '<p>Texte</p>\n',
      }),
    ).toMatchObject({ id: '3', slug: 'le-mode-accessibilite-renforcee', html: '<p>Texte</p>\n' })
  })
})
