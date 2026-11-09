<script setup lang="ts">
import { computed } from 'vue'

import { Alert } from '@kewinmarchand/boilerplates-ui/vue'

import { useDictionary } from '@/shared/i18n'
import { ScrollCarousel } from '@/shared/ui/carousel'

import { productHref } from '../domain/catalog'
import { formatPrice } from '../domain/price'
import { useFeaturedProducts } from './composables/useFeaturedProducts'

const { salesEnabled } = defineProps<{ salesEnabled: boolean }>()

const { status, data } = await useFeaturedProducts()

const t = useDictionary()
const slides = computed(() =>
  (data.value ?? []).map((product) => ({
    id: product.id,
    title: product.name,
    text: salesEnabled ? formatPrice(product.price, t.language.tag) : '',
    image: product.image,
    href: productHref(product.slug),
  })),
)
</script>

<template>
  <Alert
    v-if="status === 'error'"
    variant="error"
    :prefix="t.ui.alert.error"
    data-testid="home-carousel-error"
  >
    {{ t.catalog.featuredError }}
  </Alert>
  <ScrollCarousel
    v-else-if="slides.length"
    :slides="slides"
    labelledby="home-carousel-title"
    data-testid="home-carousel"
  >
    <h2 id="home-carousel-title">{{ t.catalog.featured }}</h2>
  </ScrollCarousel>
</template>
