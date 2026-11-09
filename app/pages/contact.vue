<script setup lang="ts">
import { useDictionary } from '@/shared/i18n'
import { usePageDictionary } from '@/shared/i18n/route'
import { usePageSeo } from '@/shared/seo'

import { ContactView } from '@/modules/contact'
import { usePageMeta } from '@/modules/identity'

await usePageDictionary(['contact', 'meta.contact'])
const meta = await usePageMeta('contact')
const t = useDictionary()

usePageSeo({
  title: t.meta.contact.title,
  adminTitle: () => meta.value.title,
  description: () => meta.value.description || t.meta.contact.description,
})
</script>

<template>
  <ContactView />
</template>
