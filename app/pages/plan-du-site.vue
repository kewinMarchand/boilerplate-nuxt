<script setup lang="ts">
import { usePageSeo } from '@/shared/seo'

import { usePageMeta } from '@/modules/identity'

import { SitemapView } from '@/views/legal'

const meta = await usePageMeta('sitemap')

usePageSeo({
  title: 'Plan du site',
  adminTitle: () => meta.value.title,
  description: () =>
    meta.value.description ||
    'Plan du site : liste de toutes les pages, des pages principales aux informations légales, générée depuis la navigation.',
})
</script>

<template>
  <SitemapView />
</template>
