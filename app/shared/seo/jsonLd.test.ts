import { organizationJsonLd } from './jsonLd'

describe('organizationJsonLd', () => {
  it('prend l’icône du front sans icône saisie', () => {
    expect(organizationJsonLd('https://exemple.test', 'Oraki').logo).toBe(
      'https://exemple.test/icon-512.png',
    )
  })

  it('prend l’icône de 512 px saisie dans l’identité du site', () => {
    expect(
      organizationJsonLd('https://exemple.test', 'Oraki', 'https://api.test/media/icon-512.png')
        .logo,
    ).toBe('https://api.test/media/icon-512.png')
  })
})
