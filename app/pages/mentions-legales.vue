<script setup lang="ts">
import { useDictionary } from '@/shared/i18n'
import { usePageSeo } from '@/shared/seo'

import { usePageMeta } from '@/modules/identity'

import { LegalNoticeView } from '@/views/legal'

const meta = await usePageMeta('legal-notice')
const t = useDictionary()

usePageSeo({
  title: t.meta.legalNotice.title,
  adminTitle: () => meta.value.title,
  description: () => meta.value.description || t.meta.legalNotice.description,
})
</script>

<template>
  <LegalNoticeView />
</template>
