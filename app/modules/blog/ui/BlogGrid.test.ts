import { render, screen } from '@testing-library/vue'

import BlogGrid from './BlogGrid.vue'

const article = (id: number) => ({
  id: String(id),
  slug: `article-${id}`,
  title: `Article ${id}`,
  excerpt: 'Extrait',
  publishedAt: '2026-10-01',
  image: null,
})

describe('BlogGrid', () => {
  it('limite la grille de l’accueil aux trois articles les plus récents', () => {
    render(BlogGrid, {
      props: { status: 'success', articles: [1, 2, 3, 4].map(article) },
      global: { stubs: { NuxtLink: { template: '<a><slot /></a>' } } },
    })

    expect(screen.getAllByTestId('home-blog-card')).toHaveLength(3)
    expect(screen.queryByText('Article 4')).not.toBeInTheDocument()
  })
})
