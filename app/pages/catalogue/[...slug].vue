<script setup lang="ts">
import { CatalogView } from '@/modules/catalog'
import { usePageMeta, useSiteIdentity } from '@/modules/identity'

const identity = await useSiteIdentity()
const meta = await usePageMeta('catalog')
</script>

<template>
  <CatalogView :root-meta="meta" :sales-enabled="identity.salesEnabled" />
</template>
