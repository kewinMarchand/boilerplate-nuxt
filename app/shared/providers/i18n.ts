import { computed } from 'vue'
import { defineNuxtPlugin } from '#imports'

import { I18N, MONOLINGUAL } from '@/shared/i18n'
import { useDictionaryState, useLocaleState } from '@/shared/i18n/route'

/** Langue et dictionnaire de la page fournis à tous les composants, sans `#imports` (testables). */
export default defineNuxtPlugin((nuxtApp) => {
  const state = useLocaleState()
  nuxtApp.vueApp.provide(I18N, {
    locale: computed(() => state.value ?? MONOLINGUAL),
    dictionary: useDictionaryState(),
  })
})
