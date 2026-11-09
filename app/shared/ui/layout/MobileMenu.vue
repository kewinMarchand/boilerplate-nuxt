<script setup lang="ts">
import { ref, useId, watch } from 'vue'

import { Drawer } from '@kewinmarchand/boilerplates-ui/vue'

import { labelNavigation, MAIN_NAVIGATION } from '@/shared/config'
import { format, useDictionary, useLocalizePath } from '@/shared/i18n'
import { Icon } from '@/shared/ui/kit'

import { useMenuDrillDown } from './composables/useMenuDrillDown'

import type { NavigationNode } from '@/shared/config'

const { menu } = defineProps<{ menu: NavigationNode }>()

const t = useDictionary()
const localizePath = useLocalizePath()
const navigation = labelNavigation(MAIN_NAVIGATION, t)
const isOpen = ref(false)
const panelId = useId()

const {
  level,
  nodes,
  title: levelTitle,
  parentTitle,
  currentHref,
  openRoot,
  descend,
  back,
  reset,
} = useMenuDrillDown(() => menu, t.layout.menu)

const close = () => {
  isOpen.value = false
}

watch(isOpen, (open) => {
  if (!open) reset()
})
</script>

<template>
  <button
    type="button"
    class="bui-button bui-button--nav bui-button--icon mobile-menu-toggle requires-js"
    :aria-label="t.layout.menu"
    aria-haspopup="dialog"
    :aria-expanded="isOpen ? 'true' : 'false'"
    :aria-controls="panelId"
    data-testid="layout-mobile-menu-toggle"
    @click="isOpen = true"
  >
    <Icon name="menu" />
  </button>

  <Drawer
    :id="panelId"
    :title="levelTitle"
    :open="isOpen"
    :close-label="t.layout.closeMenu"
    focus-title
    data-testid="layout-mobile-menu"
    @close="close"
  >
    <nav v-if="level === null" :aria-label="t.layout.mainNavigation">
      <ul class="side-panel-list">
        <li v-for="item in navigation" :key="item.href">
          <NuxtLink
            :to="localizePath(item.href)"
            class="side-panel-link"
            data-testid="layout-mobile-menu-link"
            @click="close"
            >{{ item.label }}</NuxtLink
          >
        </li>
        <li>
          <button
            type="button"
            class="side-panel-link"
            data-testid="layout-mobile-menu-catalog"
            @click="openRoot"
          >
            {{ menu.label }}
            <Icon name="chevron-right" />
          </button>
        </li>
      </ul>
    </nav>

    <nav v-else :aria-label="format(t.layout.catalogLevel, { level: levelTitle })">
      <button
        type="button"
        class="side-panel-link side-panel-back"
        data-testid="layout-mobile-menu-back"
        @click="back"
      >
        <Icon name="chevron-left" />
        {{ format(t.layout.back, { parent: parentTitle }) }}
      </button>
      <NuxtLink
        :to="localizePath(currentHref)"
        class="side-panel-link side-panel-all"
        data-testid="layout-mobile-menu-all"
        @click="close"
      >
        {{ level.length ? t.layout.wholeCategory : t.layout.wholeCatalog }}
      </NuxtLink>
      <ul class="side-panel-list">
        <li v-for="node in nodes" :key="node.id">
          <button
            v-if="node.children.length"
            type="button"
            class="side-panel-link"
            :data-testid="`layout-mobile-menu-category-${node.id}`"
            @click="descend(node.id)"
          >
            {{ node.label }}
            <Icon name="chevron-right" />
          </button>
          <NuxtLink
            v-else
            :to="localizePath(node.href)"
            class="side-panel-link"
            data-testid="layout-category-link"
            @click="close"
          >
            {{ node.label }}
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </Drawer>
</template>

<style scoped>
.mobile-menu-toggle {
  border-color: currentcolor;
}

.side-panel-all {
  font-weight: var(--bui-font-weight-bold);
}
</style>
