<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#imports'

import { useInquiryProduct } from './composables/useInquiryProduct'
import ContactForm from './ContactForm.vue'

const route = useRoute()
const slug = computed(() => {
  const value = route.query['produit']
  return typeof value === 'string' && value !== '' ? value : null
})
const product = await useInquiryProduct(slug)
</script>

<template>
  <h1>Contact</h1>
  <p>Formulaire validé par un schéma zod et envoyé via une mutation TanStack Query.</p>
  <p v-if="product" data-testid="contact-product">
    Votre demande concerne :
    <NuxtLink :to="`/produit/${product.slug}`" class="bui-link">{{ product.name }}</NuxtLink>
  </p>
  <ContactForm :product="product?.slug ?? null" />
</template>
