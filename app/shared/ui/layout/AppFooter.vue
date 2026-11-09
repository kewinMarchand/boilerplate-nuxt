<script setup lang="ts">
import { useRuntimeConfig } from '#imports'

import { labelNavigation, LEGAL_NAVIGATION } from '@/shared/config'
import { useDictionary, useLocalizePath } from '@/shared/i18n'

const { siteName } = defineProps<{ siteName: string }>()
const { devTools } = useRuntimeConfig().public
const t = useDictionary()
const localizePath = useLocalizePath()
const links = labelNavigation(LEGAL_NAVIGATION, t)
</script>

<template>
  <footer class="app-footer">
    <div class="app-container">
      <nav :aria-label="t.layout.legalLinks">
        <ul class="footer-links">
          <li v-for="item in links" :key="item.href">
            <NuxtLink
              :to="localizePath(item.href)"
              class="footer-link"
              data-testid="layout-footer-link"
            >
              {{ item.footerLabel ?? item.label }}
            </NuxtLink>
          </li>
          <li v-if="devTools">
            <NuxtLink
              :to="localizePath('/charte-graphique')"
              class="footer-link"
              data-testid="layout-styleguide-link"
            >
              {{ t.layout.styleguide }}
            </NuxtLink>
          </li>
        </ul>
      </nav>
      <p class="footer-brand">
        <img src="/images/logo-mark.svg" alt="" width="24" height="24" />
        {{ siteName }}
      </p>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  padding-block: var(--bui-space-6);
  background: var(--bui-color-surface-muted);
  font-size: var(--bui-font-size-body-sm);
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--bui-space-4);
  margin: 0 0 var(--bui-space-4);
  padding: 0;
  list-style: none;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: var(--bui-space-2);
  margin: 0;
  color: var(--bui-color-text-muted);
}

.footer-link {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: inherit;
}
</style>
