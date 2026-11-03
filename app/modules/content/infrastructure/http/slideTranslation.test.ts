import { toSlide } from './slideTranslation'

describe('toSlide', () => {
  it('identifie la diapositive par son slug et associe le visuel à son numéro', () => {
    expect(
      toSlide({ id: 1, slug: 'heliconia', title: 'Heliconia', text: 'Des bractées.', image: 3 }),
    ).toEqual({ id: 'heliconia', title: 'Heliconia', text: 'Des bractées.', image: 'slide-3' })
  })
})
