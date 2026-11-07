<script setup lang="ts">
import { computed } from 'vue'

import { Alert } from '@kewinmarchand/boilerplates-ui/vue'

import { ScrollCarousel } from '@/shared/ui/carousel'

import { useSlides } from './composables/useSlides'

const { status, data, error } = await useSlides()

const slides = computed(() => data.value ?? [])
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
