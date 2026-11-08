<script setup lang="ts">
import { computed } from 'vue'
import { defineLazyHydrationComponent, useRoute } from '#imports'

import AppBreadcrumb from './AppBreadcrumb.vue'
import AppHeader from './AppHeader.vue'
import SkipLink from './SkipLink.vue'

import type { NavigationNode } from '@/shared/config'
import type { Breadcrumb } from '@/shared/seo'

const AppFooter = defineLazyHydrationComponent('visible', () => import('./AppFooter.vue'))

const { categoryMenu, breadcrumbTrail, currentLabel } = defineProps<{
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
    <AppHeader :category-menu="categoryMenu">
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
    <AppFooter />
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
