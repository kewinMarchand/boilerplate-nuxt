<script setup lang="ts">
import { usePageSeo } from '@/shared/seo'

import { usePageMeta } from '@/modules/identity'

import { LegalNoticeView } from '@/views/legal'

const meta = await usePageMeta('legal-notice')

usePageSeo({
  title: () => meta.value.title || 'Mentions légales',
  description: () =>
    meta.value.description ||
    'Mentions légales du site : éditeur, directeur de la publication, hébergeur et propriété intellectuelle des contenus publiés.',
})
</script>

<template>
  <LegalNoticeView />
</template>
