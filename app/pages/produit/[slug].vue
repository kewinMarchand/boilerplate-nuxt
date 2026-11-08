<script setup lang="ts">
import { AddToCartButton } from '@/modules/cart'
import { ProductView } from '@/modules/catalog'
</script>

<template>
  <ProductView>
    <template #purchase="{ product }">
      <AddToCartButton
        :item="{ slug: product.slug, name: product.name, price: product.price }"
        :is-available="product.inStock"
      />
    </template>
  </ProductView>
</template>
