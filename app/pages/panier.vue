<script setup lang="ts">
import { usePageSeo } from '@/shared/seo'

import { CartView } from '@/modules/cart'

usePageSeo({
  title: 'Panier',
  description:
    'Votre panier : les produits choisis, leurs quantités et le total, gardés dans ce navigateur.',
  noindex: true,
  breadcrumbTrail: [{ label: 'Panier', href: '/panier' }],
})
</script>

<template>
  <CartView />
</template>
