import { screen } from '@testing-library/vue'
import { ref } from 'vue'

import { renderWithProviders } from '@/shared/testing/renderWithProviders'

import { LegalPageLoadError } from '../infrastructure/LegalPageLoadError'
import LegalPageContent from './LegalPageContent.vue'

const useLegalPage = vi.fn()

// Le composable importe `#imports`, que Vitest ne résout pas : son 404 n'est pas testé ici
vi.mock('./composables/useLegalPage', () => ({
  useLegalPage: (slug: string) => useLegalPage(slug),
}))

const queryState = (status: string, data: unknown = undefined, error: Error | null = null) => ({
  status: ref(status),
  data: ref(data),
  error: ref(error),
})

describe('LegalPageContent', () => {
  it("garde le titre de repli et affiche un message d'erreur si l'API ne répond pas", () => {
    useLegalPage.mockReturnValue(queryState('error', undefined, new LegalPageLoadError()))
    renderWithProviders(LegalPageContent, {
      props: { slug: 'mentions-legales', fallbackTitle: 'Mentions légales' },
    })

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Mentions légales')
    expect(screen.getByTestId('legal-error')).toHaveTextContent(
      'Impossible de charger cette page pour le moment.',
    )
    expect(screen.queryByTestId('legal-section')).not.toBeInTheDocument()
  })

  it("affiche le titre, l'introduction et chaque section avec son HTML", () => {
    useLegalPage.mockReturnValue(
      queryState('success', {
        title: 'Données personnelles',
        introduction: '<p>Avant-propos.</p>',
        sections: [
          {
            title: 'Vos droits',
            html: '<ul><li>accès ;</li></ul><p><a href="https://www.cnil.fr/">CNIL</a></p>',
          },
        ],
      }),
    )
    renderWithProviders(LegalPageContent, {
      props: { slug: 'donnees-personnelles', fallbackTitle: '' },
    })

    expect(useLegalPage).toHaveBeenCalledWith('donnees-personnelles')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Données personnelles')
    expect(screen.getByText('Avant-propos.')).toBeInTheDocument()
    expect(screen.getByTestId('legal-section')).toHaveTextContent('Vos droits')
    expect(screen.getByRole('link', { name: 'CNIL' })).toHaveAttribute(
      'href',
      'https://www.cnil.fr/',
    )
    expect(screen.getByRole('listitem')).toHaveTextContent('accès ;')
    expect(screen.queryByTestId('legal-error')).not.toBeInTheDocument()
  })
})
