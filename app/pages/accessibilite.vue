<script setup lang="ts">
import { useDictionary } from '@/shared/i18n'
import { usePageDictionary } from '@/shared/i18n/route'
import { usePageSeo } from '@/shared/seo'

import { usePageMeta } from '@/modules/identity'

import { AccessibilityStatementView } from '@/views/legal'

await usePageDictionary(['legal', 'meta.accessibility'])
const meta = await usePageMeta('accessibility')
const t = useDictionary()

usePageSeo({
  title: t.meta.accessibility.title,
  adminTitle: () => meta.value.title,
  description: () => meta.value.description || t.meta.accessibility.description,
})
</script>

<template>
  <AccessibilityStatementView />
</template>
