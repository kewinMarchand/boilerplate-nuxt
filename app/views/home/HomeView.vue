<script setup lang="ts">
import { defineLazyHydrationComponent } from '#imports'

import { BlogSection } from '@/modules/blog'

import HomeHero from './HomeHero.vue'

const { siteName, tagline } = defineProps<{ siteName: string; tagline: string }>()

const FeaturedProducts = defineLazyHydrationComponent('visible', () =>
  import('@/modules/catalog').then((catalog) => catalog.FeaturedProducts),
)
</script>

<template>
  <HomeHero :site-name="siteName" :tagline="tagline" />
  <div class="app-container home-sections">
    <FeaturedProducts />
    <BlogSection />
  </div>
</template>

<style scoped>
.home-sections {
  display: flex;
  flex-direction: column;
  gap: var(--bui-space-12);
  padding-block: var(--bui-space-12);
}
</style>
