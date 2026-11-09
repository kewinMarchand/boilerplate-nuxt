import { contactSchema } from './contactSchema'

const MESSAGES = {
  name: 'Indiquez votre nom (2 caractères minimum).',
  email: 'Indiquez une adresse e-mail valide, par exemple nom@domaine.fr.',
  message: 'Votre message doit contenir au moins 10 caractères.',
}

describe('contactSchema', () => {
  it('accepte un message complet', () => {
    const result = contactSchema(MESSAGES).safeParse({
      name: 'Ada',
      email: 'ada@exemple.fr',
      message: 'Bonjour, ceci est un message.',
    })
    expect(result.success).toBe(true)
  })

  it('rejette un e-mail invalide avec un message explicite', () => {
    const result = contactSchema(MESSAGES).safeParse({
      name: 'Ada',
      email: 'ada',
      message: 'Bonjour à tous',
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toContain('adresse e-mail valide')
  })
})
