<script setup lang="ts">
import { computed, nextTick, useTemplateRef, watch } from 'vue'
import { useRoute } from '#imports'

import { useMediaQuery } from '@/shared/ui/composables'

import {
  activeFilterCount,
  clearFilters,
  hasActiveFilters,
  withFilters,
} from '../domain/catalogQuery'
import { CATALOG_ROOT } from '../domain/categoryPath'
import { describeActiveFilters } from './activeFilters'
import ActiveFilters from './ActiveFilters.vue'
import CatalogFilters from './CatalogFilters.vue'
import CatalogPagination from './CatalogPagination.vue'
import CatalogToolbar from './CatalogToolbar.vue'
import { useCatalog } from './composables/useCatalog'
import { useCatalogSeo } from './composables/useCatalogSeo'
import FiltersDialog from './FiltersDialog.vue'
import ProductList from './ProductList.vue'

import type { CatalogPageMeta } from './composables/useCatalogSeo'

const props = defineProps<{ rootMeta?: CatalogPageMeta; salesEnabled: boolean }>()

const route = useRoute()
const { categoryPath, query, catalog, hrefFor, navigate } = useCatalog(props.salesEnabled)
const { data, status, error, refetch } = catalog
const { matches: isDesktop, isMounted } = useMediaQuery('(min-width: 1024px)')

const titleElement = useTemplateRef<HTMLElement>('titleElement')
const title = computed(() => categoryPath.value?.at(-1)?.label ?? CATALOG_ROOT.label)
const path = computed(() => route.path)
const activeFilters = computed(() =>
  describeActiveFilters(query.value, data.value?.facets.attributes ?? []).map(
    ({ id, label, query: next }) => ({
      id,
      label,
      href: hrefFor(next),
    }),
  ),
)
const clearHref = computed(() => hrefFor(clearFilters(query.value)))
const hrefForPage = (page: number) => hrefFor({ ...query.value, page })

useCatalogSeo(path, title, categoryPath, query, data, hrefForPage, () => props.rootMeta)

watch(query, async (next, previous) => {
  const pageChanged =
    next.page !== previous.page &&
    JSON.stringify({ ...next, page: 0 }) === JSON.stringify({ ...previous, page: 0 })
  const cleared = hasActiveFilters(previous) && !hasActiveFilters(next)
  await nextTick()
  const active = document.activeElement
  const focusLost = !active || active === document.body || !active.isConnected
  if (pageChanged || cleared || focusLost) titleElement.value?.focus()
})
</script>

<template>
  <div class="catalog-layout">
    <aside
      v-if="!isMounted || isDesktop"
      class="catalog-aside"
      aria-labelledby="catalog-filters-title"
      data-testid="catalog-filters"
    >
      <h2 id="catalog-filters-title" class="catalog-aside-title">Filtres</h2>
      <CatalogFilters
        v-if="data"
        :query="query"
        :facets="data.facets"
        :action="path"
        :sales-enabled="salesEnabled"
        @change="navigate"
      />
    </aside>

    <div class="catalog-main">
      <h1 ref="titleElement" tabindex="-1">{{ title }}</h1>
      <ul v-if="data?.facets.categories.length" class="subcategories a11y-chrome">
        <li v-for="category in data.facets.categories" :key="category.slug">
          <NuxtLink :to="category.href" class="subcategory">{{ category.label }}</NuxtLink>
        </li>
      </ul>

      <FiltersDialog
        v-if="isMounted && !isDesktop"
        :active-count="activeFilterCount(query)"
        :total="data?.total ?? 0"
      >
        <CatalogFilters
          v-if="data"
          :query="query"
          :facets="data.facets"
          :action="path"
          :sales-enabled="salesEnabled"
          @change="navigate"
        />
      </FiltersDialog>

      <ActiveFilters
        v-if="hasActiveFilters(query)"
        :filters="activeFilters"
        :clear-href="clearHref"
      />

      <CatalogToolbar
        :query="query"
        :total="data?.total ?? 0"
        :action="path"
        :grid-href="hrefFor({ ...query, view: 'grille' })"
        :list-href="hrefFor({ ...query, view: 'liste' })"
        :sales-enabled="salesEnabled"
        @sort="(sort) => navigate(withFilters(query, { sort }))"
      />

      <ProductList
        :status="data ? 'success' : status"
        :products="data?.items"
        :view="query.view"
        :clear-href="clearHref"
        :sales-enabled="salesEnabled"
        v-bind="error ? { errorMessage: error.message } : {}"
        @retry="refetch()"
      />

      <CatalogPagination
        v-if="data"
        :page="data.page"
        :page-count="data.pageCount"
        :href-for="hrefForPage"
      />
    </div>
  </div>
</template>

<style scoped>
.catalog-layout {
  display: grid;
  gap: 24px;
}

.catalog-aside-title {
  font-size: var(--bui-font-size-title);
}

html[data-js] .catalog-aside {
  display: none;
}

.subcategories {
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;
  margin-bottom: 16px;
}

.subcategory {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding-inline: 16px;
  border: 1px solid currentColor;
  border-radius: 22px;
  color: var(--bui-color-primary);
  text-decoration: none;
}

.catalog-main {
  min-width: 0;
}

@media (min-width: 1024px) {
  .catalog-layout {
    grid-template-columns: 280px 1fr;
    gap: 48px;
  }

  html[data-js] .catalog-aside {
    display: block;
  }

  .catalog-main :deep(.filters-open) {
    display: none;
  }
}
</style>
