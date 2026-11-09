<script setup lang="ts">
import { useDictionary } from '@/shared/i18n'
import { usePageSeo } from '@/shared/seo'

import { usePageMeta } from '@/modules/identity'

import { PersonalDataView } from '@/views/legal'

const meta = await usePageMeta('privacy')
const t = useDictionary()

usePageSeo({
  title: t.meta.privacy.title,
  adminTitle: () => meta.value.title,
  description: () => meta.value.description || t.meta.privacy.description,
})
</script>

<template>
  <PersonalDataView />
</template>
