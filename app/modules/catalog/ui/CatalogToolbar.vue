<script setup lang="ts">
import { computed, useId } from 'vue'

import { plural, useDictionary } from '@/shared/i18n'
import { Icon } from '@/shared/ui/kit'

import { sortsFor, toFormFields } from '../domain/catalogQuery'

import type { Catalog } from '../domain/catalog'

const { query, total, action, salesEnabled } = defineProps<{
  query: Catalog.Query
  total: number
  action: string
  gridHref: string
  listHref: string
  salesEnabled: boolean
}>()

const emit = defineEmits<{ sort: [sort: Catalog.Sort] }>()

const t = useDictionary()
const sortId = useId()
const sorts = computed(() => sortsFor(salesEnabled))
const hiddenFields = computed(() => toFormFields(query, ['tri']))
const countLabel = computed(() => plural(t.catalog.productCount, total, t.language.tag))

const onSortChange = (event: Event) => {
  if (!(event.target instanceof HTMLSelectElement)) return
  const { value } = event.target
  const sort = sorts.value.find((candidate) => candidate === value)
  if (sort) emit('sort', sort)
}
</script>

<template>
  <div class="catalog-toolbar a11y-chrome">
    <p role="status" aria-live="polite" class="results-count" data-testid="catalog-results-count">
      {{ countLabel }}
    </p>
    <form method="get" :action="action" class="sort-form" @submit.prevent>
      <input
        v-for="field in hiddenFields"
        :key="`${field.name}-${field.value}`"
        type="hidden"
        :name="field.name"
        :value="field.value"
      />
      <label :for="sortId">{{ t.catalog.sortBy }}</label>
      <select
        :id="sortId"
        name="tri"
        class="native-select"
        data-testid="catalog-sort"
        @change="onSortChange"
      >
        <option v-for="sort in sorts" :key="sort" :value="sort" :selected="sort === query.sort">
          {{ t.catalog.sorts[sort] }}
        </option>
      </select>
      <button type="submit" class="native-button no-js-only">{{ t.catalog.sort }}</button>
    </form>
    <nav :aria-label="t.catalog.display" class="view-toggle">
      <NuxtLink
        :to="gridHref"
        class="view-link"
        :aria-current="query.view === 'grille' ? 'page' : undefined"
        data-testid="catalog-view-grid"
      >
        <Icon name="layout-grid" />
        {{ t.catalog.views.grille }}
      </NuxtLink>
      <NuxtLink
        :to="listHref"
        class="view-link"
        :aria-current="query.view === 'liste' ? 'page' : undefined"
        data-testid="catalog-view-list"
      >
        <Icon name="layout-list" />
        {{ t.catalog.views.liste }}
      </NuxtLink>
    </nav>
  </div>
</template>

<style scoped>
.catalog-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 24px;
  margin-bottom: 24px;
}

.results-count {
  margin: 0 auto 0 0;
  font-weight: 600;
}

.sort-form,
.view-toggle {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.view-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 44px;
  padding-inline: 12px;
  border-radius: 4px;
  color: var(--bui-color-primary);
  text-decoration: none;
}

.view-link[aria-current='page'] {
  background: var(--bui-color-primary);
  color: var(--bui-color-on-primary);
}
</style>
