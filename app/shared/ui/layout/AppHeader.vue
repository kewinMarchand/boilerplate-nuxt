<script setup lang="ts">
import { MAIN_NAVIGATION, SITE } from '@/shared/config'

import A11yModeToggle from '../a11y-mode/A11yModeToggle.vue'
import ColorSchemeToggle from '../color-scheme/ColorSchemeToggle.vue'
import CategoryMenu from './CategoryMenu.vue'
import MobileMenu from './MobileMenu.vue'
import NavLink from './NavLink.vue'

import type { NavigationNode } from '@/shared/config'

const { categoryMenu } = defineProps<{ categoryMenu: NavigationNode }>()

const [HOME, ...SECONDARY_NAVIGATION] = MAIN_NAVIGATION
</script>

<template>
  <header class="app-header">
    <div class="app-container header-bar">
      <NuxtLink to="/" class="header-logo" data-testid="layout-logo">
        <img src="/images/logo-mark.svg" alt="" width="40" height="40" />
        <span>{{ SITE.name }}</span>
      </NuxtLink>
      <nav aria-label="Navigation principale" class="header-nav">
        <ul class="header-nav-list">
          <li v-if="HOME"><NavLink v-bind="HOME" /></li>
          <li class="header-nav-menu"><CategoryMenu :menu="categoryMenu" /></li>
          <li v-for="item in SECONDARY_NAVIGATION" :key="item.href"><NavLink v-bind="item" /></li>
        </ul>
      </nav>
      <div class="header-actions">
        <slot name="cart-link" />
        <MobileMenu :menu="categoryMenu" />
        <ColorSchemeToggle />
        <A11yModeToggle />
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background: var(--bui-color-primary);
  color: var(--bui-color-on-primary);
}

.header-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;
  padding-block: 8px;
}

.header-logo {
  display: inline-flex;
  flex: 1 1 0;
  align-items: center;
  gap: 12px;
  min-width: 0;
  min-height: 44px;
  color: inherit;
  font-size: var(--bui-font-size-body);
  font-weight: 600;
  line-height: 1.25;
  text-decoration: none;
}

.header-logo img {
  flex-shrink: 0;
}

.header-nav-list,
.header-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}

.header-nav-list {
  padding: 0;
  list-style: none;
}

.header-nav-menu {
  position: relative;
}

.header-actions {
  flex-wrap: nowrap;
}

html[data-js] .header-nav {
  display: none;
}

@media (min-width: 1024px) {
  .header-logo {
    flex: 0 0 auto;
    margin-right: auto;
    font-size: var(--bui-font-size-title);
    line-height: inherit;
  }

  html[data-js] .header-nav {
    display: block;
  }

  .header-actions :deep([data-testid='layout-mobile-menu-toggle']) {
    display: none;
  }
}
</style>
