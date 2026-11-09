import { eurosToCents, formatPrice, InvalidPriceError, Price } from './price'

describe('Price', () => {
  it('se construit depuis un nombre entier de centimes', () => {
    expect(Price.fromCents(2990)).toBe(2990)
  })

  it('refuse un montant négatif ou fractionnaire', () => {
    expect(() => Price.fromCents(-1)).toThrow(InvalidPriceError)
    expect(() => Price.fromCents(10.5)).toThrow(InvalidPriceError)
  })

  it('convertit des euros en centimes, arrondis', () => {
    expect(eurosToCents(29.9)).toBe(2990)
    expect(eurosToCents(10)).toBe(1000)
  })

  it('formate en euros à la française', () => {
    expect(formatPrice(Price.fromCents(2990), 'fr-FR')).toBe('29,90 €')
  })
})
