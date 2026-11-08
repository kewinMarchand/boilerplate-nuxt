<script setup lang="ts">
import { usePageSeo } from '@/shared/seo'

import { usePageMeta } from '@/modules/identity'

import { AccessibilityStatementView } from '@/views/legal'

const meta = await usePageMeta('accessibility')

usePageSeo({
  title: () => meta.value.title || 'Déclaration d’accessibilité',
  description: () =>
    meta.value.description ||
    'Déclaration d’accessibilité RGAA 4.1.2 : état de conformité, résultats des tests, contact et voies de recours.',
})
</script>

<template>
  <AccessibilityStatementView />
</template>
