export class SlidesLoadError extends Error {
  constructor(options?: ErrorOptions) {
    super('Impossible de charger le carrousel pour le moment.', options)
    this.name = 'SlidesLoadError'
  }
}
