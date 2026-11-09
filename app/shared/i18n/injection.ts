import { computed, inject } from 'vue'

import { localizePath } from './locale'

import type { Dictionary, PartialDictionary } from './dictionaries/dictionary'
import type { LanguageAlternate, LocaleContext } from './locale'
import type { InjectionKey, Ref } from 'vue'

export interface I18n {
  locale: Readonly<Ref<LocaleContext>>
  /** Sections du dictionnaire lues par le document et la page, posées au rendu serveur et transmises par le payload. */
  dictionary: Ref<PartialDictionary>
}

export const I18N: InjectionKey<I18n> = Symbol('i18n')

const useI18n = () => {
  const i18n = inject(I18N)
  if (!i18n) throw new Error('Langue absente : le plugin i18n fournit la langue de la page.')
  return i18n
}

/** Langue de la page et langues du site, fixes pour tout le document (le sélecteur recharge la page). */
export const useLocale = (): LocaleContext => useI18n().locale.value

/** Libellés de l'interface dans la langue de la page. */
export const useDictionary = (): Dictionary =>
  // Contrat vérifié par le rendu serveur de chaque page (e2e) : une section que la page n'a pas
  // demandée (`usePageDictionary`) manque et casse le rendu
  useI18n().dictionary.value as Dictionary

/** Préfixe de la langue de la page sur un chemin interne : le seul point qui préfixe les liens. */
export const useLocalizePath = () => {
  const { locale, defaultLocale } = useLocale()
  return (path: string) => localizePath(path, locale, defaultLocale)
}

/** La page dans chaque langue, fournie par la couche de routage (`app.vue`) : sélecteur et `hreflang`. */
export const PAGE_ALTERNATES: InjectionKey<Readonly<Ref<LanguageAlternate[]>>> =
  Symbol('page-alternates')

/** Aucune sans couche de routage pour la fournir (page d'erreur) : le sélecteur mène aux accueils. */
export const usePageAlternates = () =>
  inject(
    PAGE_ALTERNATES,
    computed(() => []),
    false,
  )
