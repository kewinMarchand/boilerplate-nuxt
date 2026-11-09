/** `tag` : langue de la page (BCP 47, `fr-FR`). */
export const formatPublishedAt = (isoDate: string, tag: string) =>
  new Intl.DateTimeFormat(tag, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(isoDate))
