<script setup lang="ts">
import { createError } from '#imports'

import { useDictionary } from '@/shared/i18n'
import { usePageDictionary } from '@/shared/i18n/route'
import { usePageSeo } from '@/shared/seo'

import { CartView } from '@/modules/cart'
import { useSiteIdentity } from '@/modules/identity'

await usePageDictionary(['meta.cart'])
const identity = await useSiteIdentity()
// Vente coupée : pas de panier, son stockage n'est ni lu ni effacé
if (!identity.value.salesEnabled) throw createError({ statusCode: 404, fatal: true })

const t = useDictionary()

usePageSeo({
  title: t.meta.cart.title,
  description: t.meta.cart.description,
  noindex: true,
  breadcrumbTrail: [{ label: t.meta.cart.title, href: '/panier' }],
})
</script>

<template>
  <CartView />
</template>
