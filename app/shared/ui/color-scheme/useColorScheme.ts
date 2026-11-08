import { onBeforeUnmount, onMounted, ref } from 'vue'

import { A11Y_MODE_ENHANCED } from '@/shared/ui/a11y-mode'

import { COLOR_SCHEME_STORAGE_KEY, COLOR_SCHEMES } from './colorSchemeBootScript'

import type { ColorScheme } from './colorSchemeBootScript'

const isColorScheme = (value: string | undefined | null): value is ColorScheme =>
  COLOR_SCHEMES.some((scheme) => scheme === value)

const persist = (scheme: ColorScheme) => {
  try {
    localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, scheme)
  } catch (error) {
    console.warn('Thème non mémorisé, stockage indisponible.', error)
  }
}

/** Thème choisi (système, clair, sombre) et état du mode renforcé, qui le suspend : les deux suivis sur <html>. */
export const useColorScheme = () => {
  const colorScheme = ref<ColorScheme>('auto')
  const isEnhanced = ref(false)
  let observer: MutationObserver | undefined

  const read = () => {
    const { dataset } = document.documentElement
    colorScheme.value = isColorScheme(dataset.colorScheme) ? dataset.colorScheme : 'auto'
    isEnhanced.value = dataset.a11yMode === A11Y_MODE_ENHANCED
  }

  onMounted(() => {
    read()
    observer = new MutationObserver(read)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-color-scheme', 'data-a11y-mode'],
    })
  })
  onBeforeUnmount(() => observer?.disconnect())

  const choose = (scheme: ColorScheme) => {
    document.documentElement.dataset.colorScheme = scheme
    colorScheme.value = scheme
    persist(scheme)
  }

  return { colorScheme, isEnhanced, choose }
}
