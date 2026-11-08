<script setup lang="ts">
import { createError } from '#imports'

import { usePageSeo } from '@/shared/seo'

import { CartView } from '@/modules/cart'
import { useSiteIdentity } from '@/modules/identity'

const identity = await useSiteIdentity()
// Vente coupée : pas de panier, son stockage n'est ni lu ni effacé
if (!identity.value.salesEnabled) throw createError({ statusCode: 404, fatal: true })

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
