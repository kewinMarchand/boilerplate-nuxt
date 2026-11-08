<script setup lang="ts">
import { AddToCartButton } from '@/modules/cart'
import { ProductView } from '@/modules/catalog'
import { InquiryLink } from '@/modules/contact'
import { useSiteIdentity } from '@/modules/identity'

const identity = await useSiteIdentity()
</script>

<template>
  <ProductView :sales-enabled="identity.salesEnabled">
    <template #purchase="{ product }">
      <AddToCartButton
        v-if="identity.salesEnabled"
        :item="{ slug: product.slug, name: product.name, price: product.price }"
        :is-available="product.inStock"
      />
      <InquiryLink v-else :slug="product.slug" :name="product.name" />
    </template>
  </ProductView>
</template>
