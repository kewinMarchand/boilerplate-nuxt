export class ProductLoadError extends Error {
  constructor(options?: ErrorOptions) {
    super('Impossible de charger ce produit pour le moment.', options)
    this.name = 'ProductLoadError'
  }
}
