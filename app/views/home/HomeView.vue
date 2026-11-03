<script setup lang="ts">
import { defineLazyHydrationComponent } from '#imports'

import { BlogSection } from '@/modules/blog'

import HomeHero from './HomeHero.vue'

const FeaturedCarousel = defineLazyHydrationComponent('visible', () =>
  import('@/modules/content').then((content) => content.FeaturedCarousel),
)
</script>

<template>
  <HomeHero />
  <div class="app-container home-sections">
    <FeaturedCarousel />
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
