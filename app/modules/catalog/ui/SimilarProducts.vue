<script setup lang="ts">
import { computed } from 'vue'

import { ScrollCarousel } from '@/shared/ui/carousel'

import { productHref } from '../domain/catalog'
import { formatPrice } from '../domain/price'
import { useSimilarProducts } from './composables/useSimilarProducts'

/** Autres produits de la catégorie ; section absente s'il n'y en a pas ou si l'API échoue. */
const { categorySlug, productSlug } = defineProps<{ categorySlug: string; productSlug: string }>()

const { data } = await useSimilarProducts(categorySlug, productSlug)

const slides = computed(() =>
  (data.value ?? []).map((product) => ({
    id: product.id,
    title: product.name,
    text: formatPrice(product.price),
    image: product.image,
    href: productHref(product.slug),
  })),
)
</script>

<template>
  <ScrollCarousel
    v-if="slides.length"
    :slides="slides"
    labelledby="product-similar-title"
    data-testid="product-similar"
  >
    <h2 id="product-similar-title">Produits similaires</h2>
  </ScrollCarousel>
</template>
