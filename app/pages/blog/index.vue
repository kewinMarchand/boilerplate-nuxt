<script setup lang="ts">
import { useRuntimeConfig } from '#imports'

import { usePageSeo } from '@/shared/seo'

import { BlogView } from '@/modules/blog'
import { usePageMeta } from '@/modules/identity'

const { siteUrl } = useRuntimeConfig().public
const DESCRIPTION =
  'Tous les articles du blog, du plus récent au plus ancien : accessibilité, performance, composants et retours d’expérience front-end.'
const meta = await usePageMeta('blog')
const description = () => meta.value.description || DESCRIPTION

usePageSeo({
  title: 'Blog',
  adminTitle: () => meta.value.title,
  description,
  jsonLd: () => [
    {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'Blog',
      description: description(),
      url: new URL('/blog', siteUrl).href,
      inLanguage: 'fr-FR',
    },
  ],
})
</script>

<template>
  <BlogView />
</template>
