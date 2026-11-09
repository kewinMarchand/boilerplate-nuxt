import { dictionaryFor, dictionarySections, isDictionarySection } from '@/shared/i18n/dictionaries'

/** Sections du dictionnaire qui manquent au navigateur après une navigation (`usePageDictionary`). */
export default defineEventHandler((event) => {
  const { locale, sections } = getQuery(event)
  const requested =
    typeof sections === 'string' ? sections.split(',').filter(isDictionarySection) : []
  return dictionarySections(dictionaryFor(String(locale)), requested)
})
