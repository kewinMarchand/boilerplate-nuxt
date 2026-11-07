import { toSlide } from './slideTranslation'

const IMAGE = {
  alt: 'Heliconia en gros plan',
  width: 1280,
  height: 720,
  sources: [{ type: 'image/avif' as const, srcset: 'http://api.test/media/a-640.avif 640w' }],
  src: 'http://api.test/media/a-640.webp',
}

describe('toSlide', () => {
  it('identifie la diapositive par son slug et garde l’image de l’API telle quelle', () => {
    expect(
      toSlide({
        id: 1,
        slug: 'heliconia',
        title: 'Heliconia',
        text: 'Des bractées.',
        image: IMAGE,
      }),
    ).toEqual({ id: 'heliconia', title: 'Heliconia', text: 'Des bractées.', image: IMAGE })
  })
})
