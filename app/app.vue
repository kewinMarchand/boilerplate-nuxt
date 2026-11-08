<script setup lang="ts">
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
import { computed } from 'vue'
import { useRoute } from '#imports'

import { AppShell } from '@/shared/ui/layout'

import { CartLink } from '@/modules/cart'
import { useCatalogNavigation } from '@/modules/catalog'

const route = useRoute()
const { categoryMenu, trailFor } = await useCatalogNavigation()
const breadcrumbTrail = computed(() => trailFor(route.path))
</script>

<template>
  <AppShell :category-menu="categoryMenu" :breadcrumb-trail="breadcrumbTrail">
    <NuxtPage />
    <template #cart-link><CartLink /></template>
  </AppShell>
  <ClientOnly>
    <VueQueryDevtools button-position="bottom-left" />
  </ClientOnly>
</template>
