<script setup lang="ts">
import { usePageDictionary } from '@/shared/i18n/route'

import { CatalogView } from '@/modules/catalog'
import { usePageMeta, useSiteIdentity } from '@/modules/identity'

await usePageDictionary(['catalog'])
const identity = await useSiteIdentity()
const meta = await usePageMeta('catalog')
</script>

<template>
  <CatalogView :root-meta="meta" :sales-enabled="identity.salesEnabled" />
</template>
