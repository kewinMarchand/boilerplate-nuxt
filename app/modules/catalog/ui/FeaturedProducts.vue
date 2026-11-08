<script setup lang="ts">
import { computed } from 'vue'

import { Alert } from '@kewinmarchand/boilerplates-ui/vue'

import { ScrollCarousel } from '@/shared/ui/carousel'

import { productHref } from '../domain/catalog'
import { formatPrice } from '../domain/price'
import { useFeaturedProducts } from './composables/useFeaturedProducts'

const { salesEnabled } = defineProps<{ salesEnabled: boolean }>()

const { status, data, error } = await useFeaturedProducts()

const slides = computed(() =>
  (data.value ?? []).map((product) => ({
    id: product.id,
    title: product.name,
    text: salesEnabled ? formatPrice(product.price) : '',
    image: product.image,
    href: productHref(product.slug),
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
