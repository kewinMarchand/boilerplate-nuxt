import { computed } from 'vue'
import { createError, useHead, useRoute, useState } from '#imports'

import { dictionaryFor } from './dictionaries'
import {
  FALLBACK_LOCALE,
  LOCALE_ROUTE_SUFFIX,
  localePrefix,
  pathLocale,
  unlocalizePath,
} from './locale'

import type { Dictionary } from './dictionaries/dictionary'
import type { LocaleContext } from './locale'

/** États lus par le plugin i18n et posés par `useSiteLocale` (`app.vue`, `error.vue`). */
export const useLocaleState = () => useState<LocaleContext | null>('i18n-locale', () => null)
export const useDictionaryState = () => useState<Dictionary | null>('i18n-dictionary', () => null)

/**
 * Langue demandée par l'adresse avant de connaître les langues du site (`/en/...` → `en`), pour lire
 * l'identité dans cette langue ; l'API ignore une langue qu'elle n'a pas activée.
 */
export const useRequestedLocale = () => localePrefix(useRoute().path)

/**
 * Pose la langue de la page depuis les langues du site : `<html lang>`, et dictionnaire de la page
 * (côté serveur ; le navigateur le reçoit par le payload, sans charger les autres dictionnaires).
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
  if (import.meta.server) useDictionaryState().value = dictionaryFor(context.locale)
  useHead({ htmlAttrs: { lang: context.locale } })
  return context
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
