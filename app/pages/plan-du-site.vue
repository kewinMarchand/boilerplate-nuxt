<script setup lang="ts">
import { useDictionary } from '@/shared/i18n'
import { usePageDictionary } from '@/shared/i18n/route'
import { usePageSeo } from '@/shared/seo'

import { usePageMeta } from '@/modules/identity'

import { SitemapView } from '@/views/legal'

await usePageDictionary(['legal', 'meta.sitemap'])
const meta = await usePageMeta('sitemap')
const t = useDictionary()

usePageSeo({
  title: t.meta.sitemap.title,
  adminTitle: () => meta.value.title,
  description: () => meta.value.description || t.meta.sitemap.description,
})
</script>

<template>
  <SitemapView />
</template>
