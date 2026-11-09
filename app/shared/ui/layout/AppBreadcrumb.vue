<script setup lang="ts">
import { computed } from 'vue'

import { ALL_NAVIGATION, labelNavigation } from '@/shared/config'
import { useDictionary, useLocalizePath } from '@/shared/i18n'
import { usePagePath } from '@/shared/i18n/route'
import { buildBreadcrumb } from '@/shared/seo'

import type { Breadcrumb } from '@/shared/seo'

const { currentLabel, trail, pageTrail } = defineProps<{
  currentLabel?: string
  trail?: Breadcrumb.Item[]
  pageTrail?: Breadcrumb.Item[] | null
}>()
const t = useDictionary()
const localizePath = useLocalizePath()
const pagePath = usePagePath()
const items = computed(
  () =>
    trail ??
    buildBreadcrumb(pagePath.value, labelNavigation(ALL_NAVIGATION, t), currentLabel, pageTrail),
)
</script>

<template>
  <nav
    v-if="items.length > 1"
    :aria-label="t.layout.breadcrumb"
    class="breadcrumb"
    data-testid="layout-breadcrumb"
  >
    <ol>
      <li v-for="(item, index) in items" :key="item.href">
        <span v-if="index === items.length - 1" aria-current="page">{{ item.label }}</span>
        <NuxtLink v-else :to="localizePath(item.href)">{{ item.label }}</NuxtLink>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.breadcrumb ol {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 0;
  list-style: none;
  margin-bottom: 16px;
  font-size: var(--bui-font-size-body-sm);
}

.breadcrumb li {
  display: inline-flex;
  align-items: center;
}

.breadcrumb li + li::before {
  content: '›';
  margin-inline: 8px;
  color: var(--bui-color-text-muted);
}

.breadcrumb a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: var(--bui-color-primary);
}
</style>
