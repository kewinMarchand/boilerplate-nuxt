import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/vue'

import { renderWithProviders } from '@/shared/testing/renderWithProviders'

import ContactForm from './ContactForm.vue'

import type { ContactSendResult } from '@/modules/contact/infrastructure/contactRepository'

const send = vi.fn(async (): Promise<ContactSendResult> => ({ status: 'sent' }))

vi.mock('@/modules/contact/infrastructure/contactRepository', () => ({
  useContactRepository: () => ({ send }),
}))

const field = (testId: string) => screen.getByTestId(testId)

describe('ContactForm', () => {
  it('lie le message d’erreur au champ invalide', async () => {
    renderWithProviders(ContactForm)
    await userEvent.click(screen.getByTestId('contact-submit'))

    const email = field('contact-email')
    await vi.waitFor(() => expect(email).toHaveAttribute('aria-invalid', 'true'))
    expect(email).toHaveAccessibleDescription(/adresse e-mail valide/)
  })

  it('confirme l’envoi quand le formulaire est valide', async () => {
    renderWithProviders(ContactForm)
    await userEvent.type(field('contact-name'), 'Ada')
    await userEvent.type(field('contact-email'), 'ada@exemple.fr')
    await userEvent.type(field('contact-message'), 'Bonjour, ceci est un message.')
    await userEvent.click(screen.getByTestId('contact-submit'))

    expect(await screen.findByTestId('contact-success')).toBeInTheDocument()
  })

  it('envoie le produit d’une demande de renseignement et adapte la confirmation', async () => {
    renderWithProviders(ContactForm, { props: { product: 'monstera-deliciosa' } })
    await userEvent.type(field('contact-name'), 'Ada')
    await userEvent.type(field('contact-email'), 'ada@exemple.fr')
    await userEvent.type(field('contact-message'), 'Bonjour, ceci est un message.')
    await userEvent.click(screen.getByTestId('contact-submit'))

    expect(await screen.findByTestId('contact-success')).toHaveTextContent(
      'Votre demande de renseignement a bien été envoyée.',
    )
    expect(send).toHaveBeenLastCalledWith(
      expect.objectContaining({ product: 'monstera-deliciosa' }),
      expect.anything(),
    )
  })

  it('relaie sous le champ la violation 422 renvoyée par l’API', async () => {
    send.mockResolvedValueOnce({
      status: 'invalid',
      fieldErrors: [{ field: 'name', message: 'Votre nom ne doit pas dépasser 255 caractères.' }],
    })
    renderWithProviders(ContactForm)
    await userEvent.type(field('contact-name'), 'Ada')
    await userEvent.type(field('contact-email'), 'ada@exemple.fr')
    await userEvent.type(field('contact-message'), 'Bonjour, ceci est un message.')
    await userEvent.click(screen.getByTestId('contact-submit'))

    const name = field('contact-name')
    await vi.waitFor(() => expect(name).toHaveAttribute('aria-invalid', 'true'))
    expect(name).toHaveAccessibleDescription('Votre nom ne doit pas dépasser 255 caractères.')
    expect(screen.queryByTestId('contact-success')).not.toBeInTheDocument()
  })
})
