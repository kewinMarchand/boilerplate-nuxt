export type { Dictionary } from './dictionaries/dictionary'
export type { Plural } from './format'
export { format, plural } from './format'
export type { I18n } from './injection'
export {
  I18N,
  PAGE_ALTERNATES,
  useDictionary,
  useLocale,
  useLocalizePath,
  usePageAlternates,
} from './injection'
export type { LanguageAlternate, LocaleContext } from './locale'
export {
  alternatesByKey,
  FALLBACK_LOCALE,
  languageLinks,
  languageName,
  LOCALE_PATTERN,
  LOCALE_ROUTE_SUFFIX,
  localizePath,
  MONOLINGUAL,
  ogLocale,
  samePathInEveryLocale,
} from './locale'
