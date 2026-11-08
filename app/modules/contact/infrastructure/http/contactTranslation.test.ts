import { toFieldErrors, toInquiryProduct } from './contactTranslation'

describe('toFieldErrors', () => {
  it('garde les violations des champs du formulaire, avec le message de l’API', () => {
    expect(
      toFieldErrors({
        status: 422,
        violations: [
          { propertyPath: 'email', message: 'Indiquez une adresse e-mail valide.' },
          { propertyPath: 'inconnu', message: 'Ignoré.' },
        ],
      }),
    ).toEqual([{ field: 'email', message: 'Indiquez une adresse e-mail valide.' }])
  })

  it('garde la violation du produit inconnu', () => {
    expect(
      toFieldErrors({
        status: 422,
        violations: [{ propertyPath: 'product', message: 'Ce produit n’existe pas.' }],
      }),
    ).toEqual([{ field: 'product', message: 'Ce produit n’existe pas.' }])
  })

  it('ne renvoie rien sans violations', () => {
    expect(toFieldErrors(undefined)).toEqual([])
  })
})

describe('toInquiryProduct', () => {
  it('garde le slug et le nom du produit', () => {
    expect(toInquiryProduct({ slug: 'monstera-deliciosa', name: 'Monstera deliciosa' })).toEqual({
      slug: 'monstera-deliciosa',
      name: 'Monstera deliciosa',
    })
  })
})
