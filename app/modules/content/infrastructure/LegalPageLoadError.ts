export class LegalPageLoadError extends Error {
  constructor(options?: ErrorOptions) {
    super(
      'Impossible de charger cette page pour le moment. Réessayez dans quelques minutes.',
      options,
    )
    this.name = 'LegalPageLoadError'
  }
}
