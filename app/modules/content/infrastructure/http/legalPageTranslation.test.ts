import { toLegalPage } from './legalPageTranslation'

describe('toLegalPage', () => {
  it('garde le titre, l’introduction et les sections dans leur ordre', () => {
    expect(
      toLegalPage({
        slug: 'mentions-legales',
        title: 'Mentions légales',
        introduction: '<p>Avant-propos.</p>',
        sections: [
          { title: 'Éditeur', html: '<p>Exemple SAS.</p>' },
          { title: 'Hébergeur', html: '<p>Hébergeur Exemple.</p>' },
        ],
      }),
    ).toEqual({
      title: 'Mentions légales',
      introduction: '<p>Avant-propos.</p>',
      sections: [
        { title: 'Éditeur', html: '<p>Exemple SAS.</p>' },
        { title: 'Hébergeur', html: '<p>Hébergeur Exemple.</p>' },
      ],
    })
  })
})
