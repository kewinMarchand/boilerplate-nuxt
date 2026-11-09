<script setup lang="ts">
import { usePageDictionary } from '@/shared/i18n/route'

import { AddToCartButton } from '@/modules/cart'
import { ProductView } from '@/modules/catalog'
import { InquiryLink } from '@/modules/contact'
import { useSiteIdentity } from '@/modules/identity'

const identity = await useSiteIdentity()
// Vente coupée : le lien de demande de renseignement lit la section du contact
await usePageDictionary([
  'catalog',
  'product',
  'carousel',
  ...(identity.value.salesEnabled ? [] : ['contact' as const]),
])
</script>

<template>
  <ProductView :sales-enabled="identity.salesEnabled">
    <template #purchase="{ product, translations }">
      <AddToCartButton
        v-if="identity.salesEnabled"
        :item="{
          id: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          translations,
        }"
        :is-available="product.inStock"
      />
      <InquiryLink v-else :slug="product.slug" :name="product.name" />
    </template>
  </ProductView>
</template>
