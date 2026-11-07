export class ArticleLoadError extends Error {
  constructor(options?: ErrorOptions) {
    super('Impossible de charger cet article pour le moment.', options)
    this.name = 'ArticleLoadError'
  }
}
