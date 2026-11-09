import { toArticle, toArticleDetail, toArticleTerm } from './articleTranslation'

const IMAGE = {
  alt: 'Heliconia en gros plan',
  width: 1280,
  height: 720,
  sources: [{ type: 'image/avif' as const, srcset: 'http://api.test/media/a-640.avif 640w' }],
  src: 'http://api.test/media/a-640.webp',
}

const ARTICLE = {
  id: 2,
  slug: 'un-carrousel-accessible-sans-dependance',
  title: 'Un carrousel accessible sans dépendance',
  excerpt: 'Défilement natif, boutons explicites, pas de lecture automatique.',
  publishedAt: '2026-09-22',
  image: IMAGE,
  section: null,
  format: null,
  audio: null,
  speaker: '',
}

describe('toArticle', () => {
  it('garde le contenu et garde l’image de l’API telle quelle', () => {
    expect(toArticle(ARTICLE)).toEqual({ ...ARTICLE, id: '2' })
  })

  it('garde rubrique, format, audio et intervenant', () => {
    expect(
      toArticle({
        ...ARTICLE,
        section: { slug: 'conseils', name: 'Conseils' },
        format: { slug: 'guide', name: 'Guide' },
        audio: { src: 'http://api.test/media/a.mp3', type: 'audio/mpeg', durationSeconds: 4 },
        speaker: 'Présenté par Hina Teriierooiterai',
      }),
    ).toMatchObject({
      section: { slug: 'conseils', name: 'Conseils' },
      format: { slug: 'guide', name: 'Guide' },
      audio: { src: 'http://api.test/media/a.mp3', type: 'audio/mpeg', durationSeconds: 4 },
      speaker: 'Présenté par Hina Teriierooiterai',
    })
  })
})

describe('toArticleTerm', () => {
  it('garde slug et nom', () => {
    expect(toArticleTerm({ slug: 'actualites', name: 'Actualités' })).toEqual({
      slug: 'actualites',
      name: 'Actualités',
    })
  })
})

describe('toArticleDetail', () => {
  it('ajoute le texte en HTML et les métadonnées de la fiche', () => {
    expect(
      toArticleDetail({
        ...ARTICLE,
        id: 3,
        slug: 'le-mode-accessibilite-renforcee',
        image: null,
        html: '<p>Texte</p>\n',
        metaTitle: 'Mode renforcé',
        metaDescription: '',
        alternates: [
          { locale: 'fr', slug: 'le-mode-accessibilite-renforcee' },
          { locale: 'en', slug: 'enhanced-accessibility-mode' },
        ],
      }),
    ).toMatchObject({
      id: '3',
      slug: 'le-mode-accessibilite-renforcee',
      html: '<p>Texte</p>\n',
      metaTitle: 'Mode renforcé',
      metaDescription: '',
      alternates: [
        { locale: 'fr', slug: 'le-mode-accessibilite-renforcee' },
        { locale: 'en', slug: 'enhanced-accessibility-mode' },
      ],
    })
  })
})
