<script setup lang="ts">
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
import { computed } from 'vue'
import { useRoute } from '#imports'

import { AppShell } from '@/shared/ui/layout'

import { CartLink } from '@/modules/cart'
import { useCatalogNavigation } from '@/modules/catalog'
import { useSiteIdentity, useSiteIdentityHead } from '@/modules/identity'

const route = useRoute()
const identity = await useSiteIdentity()
useSiteIdentityHead(identity)
const { categoryMenu, trailFor } = await useCatalogNavigation()
const breadcrumbTrail = computed(() => trailFor(route.path))
</script>

<template>
  <AppShell
    :site-name="identity.name"
    :logo="identity.logo"
    :category-menu="categoryMenu"
    :breadcrumb-trail="breadcrumbTrail"
  >
    <NuxtPage />
    <template v-if="identity.salesEnabled" #cart-link><CartLink /></template>
  </AppShell>
  <ClientOnly>
    <VueQueryDevtools button-position="bottom-left" />
  </ClientOnly>
</template>
