<script setup lang="ts">
import { computed } from 'vue'

import { labelNavigation, LEGAL_NAVIGATION, MAIN_NAVIGATION } from '@/shared/config'
import { useDictionary, useLocalizePath } from '@/shared/i18n'

import { CATALOG_ROOT, useCatalogNavigation } from '@/modules/catalog'

const t = useDictionary()
const localizePath = useLocalizePath()
const { catalogLinks } = await useCatalogNavigation()
const sections = computed(() => [
  {
    id: 'plan-du-site-principal',
    title: t.legal.sitemapMain,
    items: labelNavigation(MAIN_NAVIGATION, t),
  },
  {
    id: 'plan-du-site-catalogue',
    title: t.legal.sitemapCatalog,
    items: [CATALOG_ROOT, ...catalogLinks.value],
  },
  {
    id: 'plan-du-site-legal',
    title: t.legal.sitemapLegal,
    items: labelNavigation(LEGAL_NAVIGATION, t),
  },
])
</script>

<template>
  <h1>{{ t.legal.sitemapTitle }}</h1>
  <section v-for="section in sections" :key="section.id" :aria-labelledby="section.id">
    <h2 :id="section.id">{{ section.title }}</h2>
    <ul class="sitemap-list">
      <li v-for="item in section.items" :key="item.href" data-testid="legal-sitemap-item">
        <NuxtLink :to="localizePath(item.href)" class="sitemap-link bui-link">{{
          item.label
        }}</NuxtLink>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.sitemap-list {
  padding-left: 24px;
}

.sitemap-link {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
}
</style>
