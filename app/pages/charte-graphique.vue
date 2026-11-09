<script setup lang="ts">
import { createError, useRuntimeConfig } from '#imports'

import { usePageDictionary } from '@/shared/i18n/route'
import { usePageSeo } from '@/shared/seo'

import { StyleguideView } from '@/views/styleguide'

if (!useRuntimeConfig().public.devTools) {
  throw createError({ statusCode: 404, fatal: true })
}

await usePageDictionary(['catalog', 'blog'])

usePageSeo({
  title: 'Charte graphique',
  description:
    'Charte graphique du boilerplate : couleurs, typographie, espacements, composants et icônes, en développement uniquement.',
  noindex: true,
})
</script>

<template>
  <StyleguideView />
</template>
