import { screen } from '@testing-library/vue'
import { defineComponent, h, Suspense } from 'vue'

import { renderWithProviders } from '@/shared/testing/renderWithProviders'

import FeaturedCarousel from './FeaturedCarousel.vue'

import type { Carousel } from '@/shared/ui/carousel'

const findAll = vi.fn()

vi.mock('@/modules/content/infrastructure/slideRepository', () => ({
  useSlideRepository: () => ({ findAll }),
}))
vi.mock('@/shared/ui/carousel', () => ({
  ScrollCarousel: (props: { slides: Carousel.Slide[] }) =>
    h(
      'ul',
      { 'data-testid': 'home-carousel' },
      props.slides.map((slide) => h('li', { key: slide.id }, slide.image.src)),
    ),
}))

// Composant à `setup` asynchrone : rendu sous `Suspense`, enveloppé pour rester dans le conteneur du test
const renderCarousel = () =>
  renderWithProviders(
    defineComponent(
      () => () =>
        h(
          'div',
          h(Suspense, null, () => h(FeaturedCarousel)),
        ),
    ),
  )

describe('FeaturedCarousel', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  it("affiche un message d'erreur si l'API ne répond pas", async () => {
    findAll.mockRejectedValue(new Error('500'))
    renderCarousel()

    expect(
      await screen.findByTestId('home-carousel-error', {}, { timeout: 3000 }),
    ).toHaveTextContent('Impossible de charger le carrousel pour le moment.')
  })

  it("n'affiche pas le carrousel sans diapositive", async () => {
    findAll.mockResolvedValue([])
    renderCarousel()

    await vi.waitFor(() => expect(findAll).toHaveBeenCalled())
    expect(screen.queryByTestId('home-carousel')).not.toBeInTheDocument()
    expect(screen.queryByTestId('home-carousel-error')).not.toBeInTheDocument()
  })

  it('passe les diapositives au carrousel avec leur visuel', async () => {
    findAll.mockResolvedValue([
      { id: 'heliconia', title: 'Heliconia', text: '', image: 'slide-1' },
      { id: 'anthurium', title: 'Anthurium', text: '', image: 'slide-2' },
    ])
    renderCarousel()

    expect(await screen.findByTestId('home-carousel')).toHaveTextContent(
      '/images/slide-1-1280.webp/images/slide-2-1280.webp',
    )
  })
})
