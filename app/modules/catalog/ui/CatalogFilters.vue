<script setup lang="ts">
import { computed, useId } from 'vue'

import { useDictionary, useLocalizePath } from '@/shared/i18n'

import { formDataToQuery, toFormFields } from '../domain/catalogQuery'

import type { Catalog } from '../domain/catalog'

const { query, facets, action } = defineProps<{
  query: Catalog.Query
  facets: Catalog.Facet
  action: string
  salesEnabled: boolean
}>()

const emit = defineEmits<{ change: [query: Catalog.Query] }>()

const t = useDictionary()
const localizePath = useLocalizePath()
const prefix = useId()
const hiddenFields = computed(() =>
  toFormFields(query, [
    'exposition',
    'taille',
    ...facets.attributes.map((facet) => `attr-${facet.code}`),
    'prix_min',
    'prix_max',
    'en_stock',
  ]),
)

const onChange = (event: Event) => {
  const form = event.currentTarget
  if (form instanceof HTMLFormElement) emit('change', formDataToQuery(new FormData(form), query))
}
</script>

<template>
  <form
    method="get"
    :action="action"
    class="catalog-filters a11y-chrome"
    @change="onChange"
    @submit.prevent="onChange"
  >
    <input
      v-for="field in hiddenFields"
      :key="`${field.name}-${field.value}`"
      type="hidden"
      :name="field.name"
      :value="field.value"
    />

    <details v-if="facets.categories.length" open class="facet">
      <summary>{{ t.catalog.category }}</summary>
      <ul class="facet-links">
        <li v-for="category in facets.categories" :key="category.slug">
          <NuxtLink :to="localizePath(category.href)"
            >{{ category.label }} ({{ category.count }})</NuxtLink
          >
        </li>
      </ul>
    </details>

    <details open class="facet">
      <summary>{{ t.catalog.exposure }}</summary>
      <fieldset>
        <legend class="bui-visually-hidden">{{ t.catalog.exposure }}</legend>
        <label v-for="option in facets.exposures" :key="option.value" class="facet-option">
          <input
            type="checkbox"
            name="exposition"
            :value="option.value"
            :checked="query.exposures.includes(option.value)"
            :disabled="option.count === 0 && !query.exposures.includes(option.value)"
            :data-testid="`catalog-filter-exposure-${option.value}`"
          />
          {{ t.catalog.exposures[option.value] }} ({{ option.count }})
        </label>
      </fieldset>
    </details>

    <details open class="facet">
      <summary>{{ t.catalog.size }}</summary>
      <fieldset>
        <legend class="bui-visually-hidden">{{ t.catalog.size }}</legend>
        <label v-for="option in facets.sizes" :key="option.value" class="facet-option">
          <input
            type="checkbox"
            name="taille"
            :value="option.value"
            :checked="query.sizes.includes(option.value)"
            :disabled="option.count === 0 && !query.sizes.includes(option.value)"
            :data-testid="`catalog-filter-size-${option.value}`"
          />
          {{ t.catalog.sizes[option.value] }} ({{ option.count }})
        </label>
      </fieldset>
    </details>

    <details v-for="facet in facets.attributes" :key="facet.code" open class="facet">
      <summary>{{ facet.label }}</summary>
      <fieldset>
        <legend class="bui-visually-hidden">{{ facet.label }}</legend>
        <label v-for="option in facet.values" :key="option.value" class="facet-option">
          <input
            type="checkbox"
            :name="`attr-${facet.code}`"
            :value="option.value"
            :checked="query.attributes[facet.code]?.includes(option.value)"
            :disabled="option.count === 0 && !query.attributes[facet.code]?.includes(option.value)"
            :data-testid="`catalog-filter-attribute-${facet.code}-${option.value}`"
          />
          {{ option.label }} ({{ option.count }})
        </label>
      </fieldset>
    </details>

    <details v-if="salesEnabled" open class="facet">
      <summary>{{ t.catalog.price }}</summary>
      <fieldset class="facet-price">
        <legend class="bui-visually-hidden">{{ t.catalog.price }}</legend>
        <label :for="`${prefix}-min`">{{ t.catalog.priceMin }}</label>
        <input
          :id="`${prefix}-min`"
          type="number"
          name="prix_min"
          inputmode="numeric"
          min="0"
          class="native-input"
          :value="query.priceMin ?? ''"
          data-testid="catalog-filter-price-min"
        />
        <label :for="`${prefix}-max`">{{ t.catalog.priceMax }}</label>
        <input
          :id="`${prefix}-max`"
          type="number"
          name="prix_max"
          inputmode="numeric"
          min="0"
          class="native-input"
          :value="query.priceMax ?? ''"
          data-testid="catalog-filter-price-max"
        />
      </fieldset>
    </details>

    <details open class="facet">
      <summary>{{ t.catalog.availability }}</summary>
      <fieldset>
        <legend class="bui-visually-hidden">{{ t.catalog.availability }}</legend>
        <label class="facet-option">
          <input
            type="checkbox"
            role="switch"
            name="en_stock"
            value="1"
            :checked="query.inStock"
            :aria-checked="query.inStock ? 'true' : 'false'"
            data-testid="catalog-filter-in-stock"
          />
          {{ t.catalog.inStockOnly }}
        </label>
      </fieldset>
    </details>

    <button type="submit" class="native-button no-js-only" data-testid="catalog-filters-apply">
      {{ t.catalog.applyFilters }}
    </button>
  </form>
</template>

<style scoped>
.facet {
  padding-block: 8px;
  border-bottom: 1px solid var(--bui-color-border-subtle);
}

.facet summary {
  display: flex;
  align-items: center;
  min-height: 44px;
  font-weight: 600;
  cursor: pointer;
}

.facet fieldset {
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}

.facet-option,
.facet-links a {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
}

.facet-option input {
  width: 20px;
  height: 20px;
  accent-color: var(--bui-color-primary);
}

.facet-links {
  padding: 0;
  list-style: none;
}

.facet-links a {
  color: var(--bui-color-primary);
}

.facet-price {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 8px;
}
</style>
