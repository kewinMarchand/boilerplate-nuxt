<script setup lang="ts">
import { computed } from 'vue'

import { Menu } from '@kewinmarchand/boilerplates-ui/vue'

import { format, useDictionary } from '@/shared/i18n'

import { COLOR_SCHEMES } from './colorSchemeBootScript'
import { useColorScheme } from './useColorScheme'

const ICONS = { auto: 'monitor', light: 'sun', dark: 'moon' } as const

const t = useDictionary()
const LABELS = t.colorScheme.choices
const ITEMS = COLOR_SCHEMES.map((scheme) => ({
  id: scheme,
  label: LABELS[scheme].charAt(0).toUpperCase() + LABELS[scheme].slice(1),
  testId: `color-scheme-option-${scheme}`,
}))

const { colorScheme, isEnhanced, choose } = useColorScheme()

// Le mode renforcé impose le clair : un autre choix reste mémorisé mais suspendu.
const label = computed(
  () =>
    format(t.colorScheme.label, { choice: LABELS[colorScheme.value] }) +
    (isEnhanced.value && colorScheme.value !== 'light' ? t.colorScheme.suspended : ''),
)

const onSelect = (id: string) => {
  const scheme = COLOR_SCHEMES.find((candidate) => candidate === id)
  if (scheme) choose(scheme)
}
</script>

<template>
  <Menu
    id="color-scheme"
    :label="label"
    :items="ITEMS"
    :checked="colorScheme"
    :trigger-icon="ICONS[colorScheme]"
    trigger-variant="nav"
    test-id="color-scheme-toggle"
    class="requires-js"
    @select="onSelect"
  />
</template>
