import { screen } from '@testing-library/vue'
import { defineComponent, h, Suspense } from 'vue'

import { renderWithProviders } from '@/shared/testing/renderWithProviders'

import { Price } from '../domain/price'
import FeaturedProducts from './FeaturedProducts.vue'

import type { Carousel } from '@/shared/ui/carousel'

const IMAGE = {
  alt: 'Heliconia en gros plan',
  width: 1280,
  height: 720,
  sources: [{ type: 'image/avif' as const, srcset: 'http://api.test/media/a-640.avif 640w' }],
  src: 'http://api.test/media/a-640.webp',
}

const findAll = vi.fn()

vi.mock('@/modules/catalog/application/useCatalogUseCases', () => ({
  useCatalogUseCases: () => ({ loadFeaturedProducts: findAll }),
}))
vi.mock('@/shared/ui/carousel', () => ({
  ScrollCarousel: (props: { slides: Carousel.Slide[] }) =>
    h(
      'ul',
      { 'data-testid': 'home-carousel' },
      props.slides.map((slide) =>
        h('li', { key: slide.id }, [h('a', { href: slide.href }, slide.title), slide.image?.src]),
      ),
    ),
}))

// Composant à `setup` asynchrone : rendu sous `Suspense`, enveloppé pour rester dans le conteneur du test
const renderCarousel = () =>
  renderWithProviders(
    defineComponent(
      () => () =>
        h(
          'div',
          h(Suspense, null, () => h(FeaturedProducts)),
        ),
    ),
  )

describe('FeaturedProducts', () => {
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

  it("n'affiche pas le carrousel sans produit à la une", async () => {
    findAll.mockResolvedValue([])
    renderCarousel()

    await vi.waitFor(() => expect(findAll).toHaveBeenCalled())
    expect(screen.queryByTestId('home-carousel')).not.toBeInTheDocument()
    expect(screen.queryByTestId('home-carousel-error')).not.toBeInTheDocument()
  })

  it('passe chaque produit au carrousel avec son visuel et le lien de sa fiche', async () => {
    const product = (slug: string, src: string) => ({
      id: slug,
      slug,
      name: slug,
      categorySlug: 'heliconia',
      price: Price.fromCents(5490),
      exposure: 'soleil',
      size: 'L',
      inStock: true,
      image: { ...IMAGE, src },
    })
    findAll.mockResolvedValue([
      product('heliconia-rostrata', '/media/a.webp'),
      product('anthurium-clarinervium', '/media/b.webp'),
    ])
    renderCarousel()

    expect(await screen.findByTestId('home-carousel')).toHaveTextContent('/media/a.webp')
    expect(screen.getByRole('link', { name: 'heliconia-rostrata' })).toHaveAttribute(
      'href',
      '/produit/heliconia-rostrata',
    )
  })
})
