<script setup lang="ts">
import { useDictionary, useLocalizePath } from '@/shared/i18n'

const { notFound, title } = defineProps<{ notFound: boolean; title: string }>()
const t = useDictionary()
const localizePath = useLocalizePath()

const reload = () => window.location.reload()
</script>

<template>
  <h1>{{ title }}</h1>
  <template v-if="notFound">
    <p>{{ t.errors.notFoundIntro }}</p>
    <ul class="error-links">
      <li>
        <NuxtLink :to="localizePath('/')" data-testid="error-home-link">{{
          t.errors.home
        }}</NuxtLink>
      </li>
      <li>
        <NuxtLink :to="localizePath('/plan-du-site')" data-testid="error-sitemap-link">{{
          t.errors.sitemap
        }}</NuxtLink>
      </li>
      <li>
        <NuxtLink :to="localizePath('/catalogue')" data-testid="error-catalog-link">{{
          t.errors.catalog
        }}</NuxtLink>
      </li>
    </ul>
  </template>
  <template v-else>
    <p>{{ t.errors.serverIntro }}</p>
    <div class="error-actions">
      <button type="button" class="bui-button" data-testid="error-retry" @click="reload">
        {{ t.errors.retry }}
      </button>
      <NuxtLink
        :to="localizePath('/')"
        class="bui-button bui-button--outline"
        data-testid="error-home-link"
      >
        {{ t.errors.home }}
      </NuxtLink>
    </div>
  </template>
</template>

<style scoped>
.error-links a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: var(--bui-color-primary);
}
.error-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--bui-space-4);
}
</style>
