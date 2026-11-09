<script setup lang="ts">
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
import { computed, provide } from 'vue'

import { PAGE_ALTERNATES } from '@/shared/i18n'
import { assertLocaleRoute, usePagePath, useSiteLocale } from '@/shared/i18n/route'
import { AppShell } from '@/shared/ui/layout'

import { CartLink } from '@/modules/cart'
import { useCatalogNavigation } from '@/modules/catalog'
import { useSiteIdentity, useSiteIdentityHead } from '@/modules/identity'

import { useLanguageAlternates } from '@/views/document'

const identity = await useSiteIdentity()
const locale = useSiteLocale(identity.value.locales)
assertLocaleRoute(locale)
useSiteIdentityHead(identity)
const { categoryMenu, trailFor } = await useCatalogNavigation()
const pagePath = usePagePath()
const breadcrumbTrail = computed(() => trailFor(pagePath.value))
provide(PAGE_ALTERNATES, await useLanguageAlternates(locale))
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
