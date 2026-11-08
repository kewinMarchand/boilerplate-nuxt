<script setup lang="ts">
import { computed } from 'vue'
import { defineLazyHydrationComponent, useRoute } from '#imports'

import AppBreadcrumb from './AppBreadcrumb.vue'
import AppHeader from './AppHeader.vue'
import SkipLink from './SkipLink.vue'

import type { NavigationNode } from '@/shared/config'
import type { Breadcrumb } from '@/shared/seo'
import type { ResponsiveImage } from '@/shared/ui/kit'

const AppFooter = defineLazyHydrationComponent('visible', () => import('./AppFooter.vue'))

const { siteName, logo, categoryMenu, breadcrumbTrail, currentLabel } = defineProps<{
  siteName: string
  logo: ResponsiveImage | null
  categoryMenu: NavigationNode
  breadcrumbTrail?: Breadcrumb.Item[] | null
  currentLabel?: string
}>()
const route = useRoute()
const isFullBleed = computed(() => route.meta.fullBleed === true && !currentLabel)
</script>

<template>
  <div class="app-shell">
    <SkipLink />
    <AppHeader :site-name="siteName" :logo="logo" :category-menu="categoryMenu">
      <template #cart-link><slot name="cart-link" /></template>
    </AppHeader>
    <main id="main" tabindex="-1" class="app-main">
      <slot v-if="isFullBleed" />
      <div v-else class="app-container app-page">
        <AppBreadcrumb
          v-bind="currentLabel ? { currentLabel } : {}"
          :page-trail="breadcrumbTrail ?? null"
        />
        <slot />
      </div>
    </main>
    <AppFooter :site-name="siteName" />
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-main {
  flex-grow: 1;
  overflow-x: clip;
}

.app-page {
  padding-block: var(--bui-space-8);
}
</style>
