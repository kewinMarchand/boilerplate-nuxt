<script setup lang="ts">
import { usePageSeo } from '@/shared/seo'

import { ContactView } from '@/modules/contact'
import { usePageMeta } from '@/modules/identity'

const meta = await usePageMeta('contact')

usePageSeo({
  title: 'Contact',
  adminTitle: () => meta.value.title,
  description: () =>
    meta.value.description ||
    'Démo de formulaire : validation par schéma zod avec vee-validate, erreurs liées aux champs et envoi par mutation TanStack Query.',
})
</script>

<template>
  <ContactView />
</template>
