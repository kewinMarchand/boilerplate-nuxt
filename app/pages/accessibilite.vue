<script setup lang="ts">
import { useDictionary } from '@/shared/i18n'
import { usePageSeo } from '@/shared/seo'

import { usePageMeta } from '@/modules/identity'

import { AccessibilityStatementView } from '@/views/legal'

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
