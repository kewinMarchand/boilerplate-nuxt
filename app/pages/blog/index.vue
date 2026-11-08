<script setup lang="ts">
import { useRuntimeConfig } from '#imports'

import { usePageSeo } from '@/shared/seo'

import { BlogView } from '@/modules/blog'

const { siteUrl } = useRuntimeConfig().public
const DESCRIPTION =
  'Tous les articles du blog, du plus récent au plus ancien : accessibilité, performance, composants et retours d’expérience front-end.'

usePageSeo({
  title: 'Blog',
  description: DESCRIPTION,
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'Blog',
      description: DESCRIPTION,
      url: new URL('/blog', siteUrl).href,
      inLanguage: 'fr-FR',
    },
  ],
})
</script>

<template>
  <BlogView />
</template>
