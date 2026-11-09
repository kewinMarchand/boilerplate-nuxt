<script setup lang="ts">
import { useDictionary } from '@/shared/i18n'
import { Icon } from '@/shared/ui/kit'

defineProps<{
  filters: { id: string; label: string; href: string }[]
  clearHref: string
}>()

const t = useDictionary()
</script>

<template>
  <div class="active-filters a11y-chrome" data-testid="catalog-active-filters">
    <ul>
      <li v-for="filter in filters" :key="filter.id">
        <NuxtLink :to="filter.href" class="chip" data-testid="catalog-active-filter">
          <span class="bui-visually-hidden">{{ t.catalog.removeFilter }}</span
          >{{ filter.label }}
          <Icon name="x" :size="16" />
        </NuxtLink>
      </li>
    </ul>
    <NuxtLink :to="clearHref" class="clear-link" data-testid="catalog-clear-filters">
      {{ t.catalog.clearFilters }}
    </NuxtLink>
  </div>
</template>

<style scoped>
.active-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.active-filters ul {
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;
}

.chip,
.clear-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 44px;
  padding-inline: 12px;
  border-radius: 22px;
  color: var(--bui-color-primary);
}

.chip {
  border: 1px solid currentColor;
  text-decoration: none;
}
</style>
