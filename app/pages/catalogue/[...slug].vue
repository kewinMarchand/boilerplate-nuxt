<script setup lang="ts">
import { CatalogView } from '@/modules/catalog'
import { usePageMeta } from '@/modules/identity'

const meta = await usePageMeta('catalog')
</script>

<template>
  <CatalogView :root-meta="meta" />
</template>
