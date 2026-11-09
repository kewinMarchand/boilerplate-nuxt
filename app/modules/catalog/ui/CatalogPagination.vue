<script setup lang="ts">
import { computed } from 'vue'

import { useDictionary } from '@/shared/i18n'
import { Icon } from '@/shared/ui/kit'

import { paginationWindow } from './pagination'

const { page, pageCount, hrefFor } = defineProps<{
  page: number
  pageCount: number
  hrefFor: (page: number) => string
}>()

const t = useDictionary()
const entries = computed(() => paginationWindow(page, pageCount))
</script>

<template>
  <nav
    v-if="pageCount > 1"
    :aria-label="t.catalog.pagination"
    class="pagination a11y-chrome"
    data-testid="catalog-pagination"
  >
    <ul>
      <li>
        <NuxtLink
          v-if="page > 1"
          :to="hrefFor(page - 1)"
          rel="prev"
          class="page-link"
          data-testid="catalog-pagination-prev"
        >
          <Icon name="chevron-left" />
          {{ t.catalog.previous }}
        </NuxtLink>
        <span v-else class="page-link is-disabled">
          <Icon name="chevron-left" />
          {{ t.catalog.previous }}
        </span>
      </li>
      <li v-for="(entry, index) in entries" :key="`${entry}-${index}`">
        <span v-if="entry === 'ellipsis'" class="page-link">…</span>
        <span v-else-if="entry === page" class="page-link is-current" aria-current="page">
          <span class="bui-visually-hidden">{{ t.catalog.page }}</span
          >{{ entry }}
        </span>
        <NuxtLink
          v-else
          :to="hrefFor(entry)"
          class="page-link"
          :data-testid="`catalog-pagination-page-${entry}`"
        >
          <span class="bui-visually-hidden">{{ t.catalog.page }}</span
          >{{ entry }}
        </NuxtLink>
      </li>
      <li>
        <NuxtLink
          v-if="page < pageCount"
          :to="hrefFor(page + 1)"
          rel="next"
          class="page-link"
          data-testid="catalog-pagination-next"
        >
          {{ t.catalog.next }}
          <Icon name="chevron-right" />
        </NuxtLink>
        <span v-else class="page-link is-disabled">
          {{ t.catalog.next }}
          <Icon name="chevron-right" />
        </span>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.pagination ul {
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px;
  list-style: none;
  margin-block: 32px 0;
}

.page-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 44px;
  min-height: 44px;
  padding-inline: 8px;
  border-radius: 4px;
  color: var(--bui-color-primary);
}

.is-current {
  background: var(--bui-color-primary);
  color: var(--bui-color-on-primary);
  font-weight: 700;
}

.is-disabled {
  color: var(--bui-color-text-muted);
}
</style>
