<script setup lang="ts">
import { usePageSeo } from '@/shared/seo'

import { usePageMeta } from '@/modules/identity'

import { PersonalDataView } from '@/views/legal'

const meta = await usePageMeta('privacy')

usePageSeo({
  title: () => meta.value.title || 'Données personnelles',
  description: () =>
    meta.value.description ||
    'Traitement des données personnelles : responsable, finalité du formulaire de contact, base légale, conservation et droits.',
})
</script>

<template>
  <PersonalDataView />
</template>
