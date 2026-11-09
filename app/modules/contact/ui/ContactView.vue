<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#imports'

import { useDictionary, useLocalizePath } from '@/shared/i18n'

import { useInquiryProduct } from './composables/useInquiryProduct'
import ContactForm from './ContactForm.vue'

const route = useRoute()
const slug = computed(() => {
  const value = route.query['produit']
  return typeof value === 'string' && value !== '' ? value : null
})
const product = await useInquiryProduct(slug)
const t = useDictionary()
const localizePath = useLocalizePath()
</script>

<template>
  <h1>{{ t.contact.title }}</h1>
  <p>{{ t.contact.intro }}</p>
  <p v-if="product" data-testid="contact-product">
    {{ t.contact.product }}
    <NuxtLink :to="localizePath(`/produit/${product.slug}`)" class="bui-link">{{
      product.name
    }}</NuxtLink>
  </p>
  <ContactForm :product="product?.slug ?? null" />
</template>
