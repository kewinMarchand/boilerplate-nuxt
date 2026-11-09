<script setup lang="ts">
import { ref, useId } from 'vue'

import { Button, Drawer } from '@kewinmarchand/boilerplates-ui/vue'

import { format, useDictionary } from '@/shared/i18n'
import { Icon } from '@/shared/ui/kit'

defineProps<{ activeCount: number; total: number }>()

const t = useDictionary()
const isOpen = ref(false)
const drawerId = useId()
</script>

<template>
  <button
    type="button"
    class="bui-button bui-button--outline filters-open requires-js"
    aria-haspopup="dialog"
    :aria-expanded="isOpen ? 'true' : 'false'"
    :aria-controls="drawerId"
    data-testid="catalog-filters-open"
    @click="isOpen = true"
  >
    <Icon name="list-filter" />
    {{ t.catalog.filterButton }}
    <span v-if="activeCount">&nbsp;({{ activeCount }})</span>
  </button>

  <Drawer
    :id="drawerId"
    :title="t.catalog.filters"
    :open="isOpen"
    side="start"
    :close-label="t.catalog.closeFilters"
    @close="isOpen = false"
  >
    <div v-if="isOpen" data-testid="catalog-filters">
      <slot />
    </div>
    <template #footer>
      <Button full-width @click="isOpen = false">{{
        format(t.catalog.showProducts, { total })
      }}</Button>
    </template>
  </Drawer>
</template>
