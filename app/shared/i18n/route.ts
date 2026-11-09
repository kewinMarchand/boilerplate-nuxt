import { computed } from 'vue'
import { createError, useHead, useRoute, useState } from '#imports'

import { dictionaryFor, dictionarySections } from './dictionaries'
import {
  FALLBACK_LOCALE,
  LOCALE_ROUTE_SUFFIX,
  localePrefix,
  pathLocale,
  unlocalizePath,
} from './locale'

import type { DictionarySection, PartialDictionary } from './dictionaries/dictionary'
import type { LocaleContext } from './locale'

/** États lus par le plugin i18n et posés par `useSiteLocale` (`app.vue`, `error.vue`). */
export const useLocaleState = () => useState<LocaleContext | null>('i18n-locale', () => null)
export const useDictionaryState = () => useState<PartialDictionary>('i18n-dictionary', () => ({}))

/** Sections lues par l'en-tête (lien du panier compris), le pied, la page d'erreur et le SEO commun. */
const DOCUMENT_SECTIONS: DictionarySection[] = [
  'language',
  'nav',
  'compliance',
  'layout',
  'ui',
  'a11yMode',
  'colorScheme',
  'errors',
  'cart',
]

/**
 * Langue demandée par l'adresse avant de connaître les langues du site (`/en/...` → `en`), pour lire
 * l'identité dans cette langue ; l'API ignore une langue qu'elle n'a pas activée.
 */
export const useRequestedLocale = () => localePrefix(useRoute().path)

/**
 * Pose la langue de la page depuis les langues du site : `<html lang>`, et sections du dictionnaire
 * communes à toutes les pages (côté serveur ; le navigateur les reçoit par le payload).
 */
export const useSiteLocale = (locales: string[]) => {
  const route = useRoute()
  const [defaultLocale = FALLBACK_LOCALE] = locales
  const context: LocaleContext = {
    locale: pathLocale(route.path, locales),
    defaultLocale,
    locales,
  }
  useLocaleState().value = context
  if (import.meta.server) {
    useDictionaryState().value = dictionarySections(
      dictionaryFor(context.locale),
      DOCUMENT_SECTIONS,
    )
  }
  useHead({ htmlAttrs: { lang: context.locale } })
  return context
}

/** Sections par nom, métadonnées par page : `catalog` ou `meta.contact`. */
type Sections = Record<string, Record<string, unknown> | undefined>

const hasSection = (dictionary: Sections, section: string) => {
  const [name = '', page] = section.split('.')
  return page ? !!dictionary[name]?.[page] : !!dictionary[name]
}

const addSections = (dictionary: Sections, sections: Sections) => {
  for (const [name, value] of Object.entries(sections)) {
    dictionary[name] = { ...dictionary[name], ...value }
  }
}

/**
 * Ajoute aux sections du document celles que lisent les composants de la page (couche de routage,
 * avant `useDictionary`). Au rendu serveur, elles partent dans le payload ; à une navigation dans le
 * navigateur, celles qui manquent sont demandées au serveur (`/api/dictionary`).
 */
export const usePageDictionary = async (sections: DictionarySection[]) => {
  const dictionary = useDictionaryState().value
  const locale = useLocaleState().value?.locale ?? FALLBACK_LOCALE
  if (import.meta.server) {
    addSections(dictionary, dictionarySections(dictionaryFor(locale), sections))
    return
  }
  const missing = sections.filter((section) => !hasSection(dictionary, section))
  if (!missing.length) return
  try {
    addSections(
      dictionary,
      await $fetch<PartialDictionary>('/api/dictionary', {
        query: { locale, sections: missing.join(',') },
      }),
    )
  } catch (error) {
    console.error(error)
    throw createError({ statusCode: 500, fatal: true, cause: error })
  }
}

/** Préfixe de langue d'une route (`/:locale/...`) qui ne désigne pas une langue activée : 404. */
export const assertLocaleRoute = ({ locale, defaultLocale }: LocaleContext) => {
  const route = useRoute()
  const prefix = route.params.locale
  if (typeof prefix === 'string' && (prefix === defaultLocale || prefix !== locale)) {
    // Même message qu'une adresse sans route
    throw createError({
      statusCode: 404,
      statusMessage: `Page not found: ${route.path}`,
      fatal: true,
    })
  }
}

/** Nom de la route sans le suffixe des routes préfixées par la langue (`produit-slug`). */
export const useRouteName = () => {
  const route = useRoute()
  return computed(() => String(route.name ?? '').replace(LOCALE_ROUTE_SUFFIX, ''))
}

/** Chemin de la page sans préfixe de langue, pour les calculs qui ignorent la langue (fil d'Ariane, menu). */
export const usePagePath = () => {
  const route = useRoute()
  const state = useLocaleState()
  return computed(() => (state.value ? unlocalizePath(route.path, state.value) : route.path))
}
