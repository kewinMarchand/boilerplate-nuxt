<script setup lang="ts">
import { Alert, Button, Skeleton } from '@kewinmarchand/boilerplates-ui/vue'

import { useDictionary } from '@/shared/i18n'
import { Icon } from '@/shared/ui/kit'

import ProductCard from './ProductCard.vue'

import type { Catalog } from '../domain/catalog'

const EAGER_COUNT = 4

defineProps<{
  status: 'pending' | 'error' | 'success'
  products: Catalog.Product[] | undefined
  view: Catalog.View
  clearHref: string
  salesEnabled: boolean
  errorMessage?: string
}>()

const emit = defineEmits<{ retry: [] }>()
const t = useDictionary()
</script>

<template>
  <div
    v-if="status === 'pending'"
    role="status"
    aria-busy="true"
    :aria-label="t.catalog.loadingProducts"
    class="product-grid"
  >
    <Skeleton v-for="key in 4" :key="key" height="320px" />
  </div>

  <Alert v-else-if="status === 'error'" variant="error" data-testid="catalog-error">
    {{ errorMessage }}
    <template #action>
      <Button variant="ghost" data-testid="catalog-retry" @click="emit('retry')">
        <Icon name="rotate-cw" />
        {{ t.catalog.retry }}
      </Button>
    </template>
  </Alert>

  <div v-else-if="!products?.length" class="catalog-empty" data-testid="catalog-empty">
    <p>{{ t.catalog.empty }}</p>
    <NuxtLink :to="clearHref" class="bui-button bui-button--outline">{{
      t.catalog.clearFilters
    }}</NuxtLink>
  </div>

  <div v-else class="product-grid" :class="{ 'is-list': view === 'liste' }">
    <ProductCard
      v-for="(product, index) in products"
      :key="product.id"
      :product="product"
      :eager="index < EAGER_COUNT"
      :priority="index === 0"
      :show-price="salesEnabled"
    />
  </div>
</template>

<style scoped>
.product-grid {
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr;
}

.catalog-empty {
  padding: 24px;
  border: 1px dashed var(--bui-color-border-subtle);
  border-radius: 8px;
}

@media (min-width: 480px) {
  .product-grid:not(.is-list) {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}
</style>
