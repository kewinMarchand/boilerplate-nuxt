<script setup lang="ts">
import { computed } from 'vue'

import { Alert } from '@kewinmarchand/boilerplates-ui/vue'

import { ScrollCarousel } from '@/shared/ui/carousel'
import { buildSources } from '@/shared/ui/kit/imageSources'

import { useSlides } from './composables/useSlides'

import type { Carousel } from '@/shared/ui/carousel'

const SLIDE_WIDTHS = [640, 750, 960, 1280]

const { status, data, error } = await useSlides()

const slides = computed<Carousel.Slide[]>(() =>
  (data.value ?? []).map((slide) => ({
    ...slide,
    image: {
      src: `/images/${slide.image}-1280.webp`,
      sources: buildSources(slide.image, SLIDE_WIDTHS),
      width: 1280,
      height: 720,
    },
  })),
)
</script>

<template>
  <Alert v-if="status === 'error'" variant="error" data-testid="home-carousel-error">
    {{ error?.message }}
  </Alert>
  <ScrollCarousel
    v-else-if="slides.length"
    :slides="slides"
    labelledby="home-carousel-title"
    data-testid="home-carousel"
  >
    <h2 id="home-carousel-title">À la une</h2>
  </ScrollCarousel>
</template>
