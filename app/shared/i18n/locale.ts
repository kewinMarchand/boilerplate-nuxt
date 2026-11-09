/** Langue des libellés quand une langue activée n'a pas de fichier de traduction. */
export const FALLBACK_LOCALE = 'fr'

/** Suffixe du nom des routes préfixées par la langue (`produit-slug___locale`), posé par `nuxt.config.ts`. */
export const LOCALE_ROUTE_SUFFIX = '___locale'

/** Préfixe de langue reconnu par le routeur (`/en/...`), vérifié ensuite contre les langues du site. */
export const LOCALE_PATTERN = '[a-z]{2}'

/** Langue de la page et langues du site (`locales` de l'identité, la première est la langue par défaut). */
export interface LocaleContext {
  locale: string
  defaultLocale: string
  locales: string[]
}

export const MONOLINGUAL: LocaleContext = {
  locale: FALLBACK_LOCALE,
  defaultLocale: FALLBACK_LOCALE,
  locales: [FALLBACK_LOCALE],
}

/** Un élément dans une langue : chemin sans préfixe de langue (`/produit/swiss-cheese-plant`). */
export interface LanguageAlternate {
  locale: string
  path: string
}

const isInternalPath = (path: string) => path.startsWith('/') && !path.startsWith('//')

/** Premier segment d'un chemin s'il a la forme d'un préfixe de langue (`en`), sinon `undefined`. */
export const localePrefix = (path: string) => {
  const first = path.split(/[/?#]/)[1] ?? ''
  return new RegExp(`^${LOCALE_PATTERN}$`).test(first) ? first : undefined
}

/** Chemin dans une langue : sans préfixe pour la langue par défaut, `/en/...` pour les autres. */
export const localizePath = (path: string, locale: string, defaultLocale: string) => {
  if (locale === defaultLocale || !isInternalPath(path)) return path
  return path === '/' || /^\/[?#]/.test(path) ? `/${locale}${path.slice(1)}` : `/${locale}${path}`
}

/** Langue d'une adresse publique : son préfixe s'il désigne une langue activée autre que la langue par défaut. */
export const pathLocale = (path: string, locales: string[]) => {
  const [defaultLocale = FALLBACK_LOCALE, ...prefixed] = locales
  const prefix = localePrefix(path)
  return prefix && prefixed.includes(prefix) ? prefix : defaultLocale
}

/** Chemin sans le préfixe de la langue de la page (`/en/catalogue` → `/catalogue`). */
export const unlocalizePath = (path: string, { locale, defaultLocale }: LocaleContext) => {
  if (locale === defaultLocale) return path
  if (path === `/${locale}`) return '/'
  return path.startsWith(`/${locale}/`) ? path.slice(locale.length + 1) : path
}

/**
 * Une entrée par langue du site, dans l'ordre de `locales` : l'équivalent donné par `alternates`,
 * sinon `fallback` (l'accueil pour une page détaillée sans équivalent).
 */
export const languageLinks = (
  { locales, defaultLocale }: LocaleContext,
  alternates: LanguageAlternate[],
  fallback = '/',
) =>
  locales.map((locale) => ({
    locale,
    href: localizePath(
      alternates.find((alternate) => alternate.locale === locale)?.path ?? fallback,
      locale,
      defaultLocale,
    ),
  }))

/** Même chemin dans chaque langue : pages fixes, dont les segments ne se traduisent pas. */
export const samePathInEveryLocale = ({ locales }: LocaleContext, path: string) =>
  locales.map((locale): LanguageAlternate => ({ locale, path }))

interface LocaleEntries {
  locale: string
  entries: { key: string; path: string }[]
}

/**
 * Un groupe par élément (sitemap) : son chemin dans chaque langue, associé par `key` (identifiant
 * stable de l'élément), dans l'ordre de la première langue, la langue par défaut.
 */
export const alternatesByKey = ([first, ...others]: LocaleEntries[]): LanguageAlternate[][] =>
  first
    ? first.entries.map(({ key, path }) => [
        { locale: first.locale, path },
        ...others.flatMap(({ locale, entries }) => {
          const match = entries.find((entry) => entry.key === key)
          return match ? [{ locale, path: match.path }] : []
        }),
      ])
    : []

const OG_LOCALES: Record<string, string> = { fr: 'fr_FR', en: 'en_US' }

/** Langue au format Open Graph (`fr_FR`), le code seul pour une langue sans région connue. */
export const ogLocale = (locale: string) => OG_LOCALES[locale] ?? locale

/** Nom d'une langue dans cette langue (« Français », « English »), pour le sélecteur. */
export const languageName = (locale: string) => {
  const name = new Intl.DisplayNames([locale], { type: 'language' }).of(locale) ?? locale
  return name.charAt(0).toUpperCase() + name.slice(1)
}
