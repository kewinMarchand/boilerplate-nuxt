<script setup lang="ts">
import { computed } from 'vue'

import { useDictionary } from '@/shared/i18n'
import { useSiteLocale } from '@/shared/i18n/route'
import { usePageSeo } from '@/shared/seo'
import { AppShell } from '@/shared/ui/layout'

import { CartLink } from '@/modules/cart'
import { useCatalogNavigation } from '@/modules/catalog'
import { useSiteIdentity, useSiteIdentityHead } from '@/modules/identity'

import { ErrorView } from '@/views/errors'

import type { NuxtError } from '#app'

const { error } = defineProps<{ error: NuxtError }>()
const identity = await useSiteIdentity()
useSiteLocale(identity.value.locales)
const t = useDictionary()
useSiteIdentityHead(identity)
const { categoryMenu } = await useCatalogNavigation()
const isNotFound = computed(() => error.status === 404)
const title = computed(() => (isNotFound.value ? t.errors.notFoundTitle : t.errors.serverTitle))

usePageSeo({
  title,
  description: () => (isNotFound.value ? t.errors.notFoundDescription : t.errors.serverDescription),
  noindex: true,
  breadcrumbLabel: title.value,
})
</script>

<template>
  <AppShell
    :site-name="identity.name"
    :logo="identity.logo"
    :category-menu="categoryMenu"
    :current-label="title"
  >
    <ErrorView :not-found="isNotFound" :title="title" />
    <template v-if="identity.salesEnabled" #cart-link><CartLink /></template>
  </AppShell>
</template>
