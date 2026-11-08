<script setup lang="ts">
import { useHead } from '#imports'

import { buildSources, buildSrcset } from '@/shared/ui/kit/imageSources'

const { siteName, tagline } = defineProps<{ siteName: string; tagline: string }>()

const HERO_WIDTHS = [640, 828, 960, 1280, 1920]
const HERO_SIZES = '100vw'
const HERO_SOURCES = buildSources('hero', HERO_WIDTHS)

useHead({
  link: [
    {
      rel: 'preload',
      as: 'image',
      type: 'image/avif',
      imagesrcset: buildSrcset('hero', HERO_WIDTHS, 'avif'),
      imagesizes: HERO_SIZES,
      fetchpriority: 'high',
    },
  ],
})
</script>

<template>
  <section class="hero" data-testid="home-hero">
    <picture>
      <source
        v-for="source in HERO_SOURCES"
        :key="source.type"
        :type="source.type"
        :srcset="source.srcset"
        :sizes="HERO_SIZES"
      />
      <img
        src="/images/hero-1280.webp"
        alt=""
        width="1920"
        height="1080"
        fetchpriority="high"
        class="hero-image"
      />
    </picture>
    <div class="hero-veil" />
    <div class="hero-content app-container">
      <p class="hero-eyebrow">Boilerplate Nuxt 4 · boilerplates-ui · TanStack Query</p>
      <h1>{{ siteName }}</h1>
      <p v-if="tagline" class="hero-text">{{ tagline }}</p>
      <div class="hero-actions">
        <NuxtLink to="/taches" class="bui-button bui-button--lg" data-testid="home-tasks-link">
          Voir la démo TanStack Query
        </NuxtLink>
        <NuxtLink
          to="/contact"
          class="bui-button bui-button--outline-light bui-button--lg"
          data-testid="home-contact-link"
        >
          Voir le formulaire
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 520px;
  color: var(--bui-color-on-image);
  overflow: hidden;
}

.hero-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-veil {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgb(0 0 0 / 0.78) 0%, rgb(0 0 0 / 0.58) 100%);
}

[data-a11y-mode='enhanced'] .hero-veil {
  background: rgb(0 0 0 / 0.85);
}

.hero-content {
  position: relative;
  padding-block: 48px;
}

.hero-eyebrow {
  font-size: var(--bui-font-size-body-sm);
  font-weight: var(--bui-font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--bui-space-4);
}

.hero-text {
  max-width: 640px;
  font-size: var(--bui-font-size-lead);
}

@media (min-width: 1024px) {
  .hero {
    min-height: min(80vh, 720px);
  }
}
</style>
