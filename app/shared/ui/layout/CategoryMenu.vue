<script setup lang="ts">
import { nextTick, ref, useId, useTemplateRef, watch } from 'vue'

import { useDictionary, useLocalizePath } from '@/shared/i18n'
import { Icon } from '@/shared/ui/kit'

import { useCategoryMenu } from './composables/useCategoryMenu'

import type { NavigationNode } from '@/shared/config'

const { menu } = defineProps<{ menu: NavigationNode }>()

const t = useDictionary()
const localizePath = useLocalizePath()
const panelId = useId()
const root = useTemplateRef<HTMLElement>('root')
const toggleButton = useTemplateRef<HTMLButtonElement>('toggleButton')
const columnId = (depth: number) => `${panelId}-${depth}`

const { isOpen, columns, isExpanded, reveal, close, toggle, onKeydown } = useCategoryMenu(
  root,
  () => menu,
  () => toggleButton.value?.focus(),
)

const panel = useTemplateRef<HTMLElement>('panel')
const alignEnd = ref(false)

watch([isOpen, columns], async () => {
  await nextTick()
  if (!isOpen.value || !panel.value || !toggleButton.value) return
  const button = toggleButton.value.getBoundingClientRect()
  alignEnd.value = button.left + panel.value.offsetWidth > document.documentElement.clientWidth
})
</script>

<template>
  <div ref="root" class="category-menu" @keydown="onKeydown">
    <NuxtLink :to="localizePath(menu.href)" class="header-link no-js-only">
      {{ menu.label }}
    </NuxtLink>
    <button
      ref="toggleButton"
      type="button"
      class="header-link requires-js"
      :aria-expanded="isOpen ? 'true' : 'false'"
      :aria-controls="panelId"
      data-testid="layout-category-menu-toggle"
      @click="toggle"
    >
      {{ menu.label }}
      <Icon name="chevron-down" />
    </button>
    <div
      v-show="isOpen"
      :id="panelId"
      ref="panel"
      class="category-panel"
      :class="{ 'is-end-aligned': alignEnd }"
      data-testid="layout-category-menu"
    >
      <NuxtLink
        :to="localizePath(menu.href)"
        class="category-link category-all"
        data-testid="layout-category-link"
        @click="close"
      >
        {{ t.layout.wholeCatalog }}
      </NuxtLink>
      <div class="category-columns">
        <ul
          v-for="column in columns"
          :id="columnId(column.depth)"
          :key="column.depth"
          class="category-column"
        >
          <li v-for="node in column.nodes" :key="node.id">
            <NuxtLink
              :to="localizePath(node.href)"
              class="category-link"
              :aria-expanded="node.children.length ? isExpanded(column.depth, node.id) : undefined"
              :aria-controls="
                isExpanded(column.depth, node.id) ? columnId(column.depth + 1) : undefined
              "
              data-testid="layout-category-link"
              @mouseenter="reveal(column.depth, node)"
              @focus="reveal(column.depth, node)"
              @click="close"
            >
              {{ node.label }}
              <Icon v-if="node.children.length" name="chevron-right" />
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.category-panel {
  position: absolute;
  width: max-content;
  inset-block-start: 100%;
  inset-inline-start: 0;
  z-index: var(--app-z-menu);
  padding: 8px;
  background: var(--bui-color-surface);
  color: var(--bui-color-text);
  border-radius: 8px;
  box-shadow: var(--bui-shadow-lg);
}

.category-panel.is-end-aligned {
  inset-inline-start: auto;
  inset-inline-end: 0;
}

.category-columns {
  display: flex;
}

.category-column {
  flex: 0 0 240px;
  padding: 0;
  list-style: none;
}

.category-column + .category-column {
  border-left: 1px solid var(--bui-color-border-subtle);
}

.category-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
  padding-inline: 12px;
  color: inherit;
  text-decoration: none;
  border-radius: 4px;
}

.category-link:hover,
.category-link[aria-expanded='true'] {
  background: var(--bui-color-primary-surface-subtle);
}

.category-all {
  font-weight: 600;
  color: var(--bui-color-primary);
}
</style>
