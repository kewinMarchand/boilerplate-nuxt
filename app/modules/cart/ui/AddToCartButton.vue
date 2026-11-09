<script setup lang="ts">
import { ref } from 'vue'

import { Button } from '@kewinmarchand/boilerplates-ui/vue'

import { format, useDictionary, useLocalizePath } from '@/shared/i18n'

import { CART_PATH } from './cartPath'
import { useCart } from './composables/useCart'

import type { Cart } from '../domain/cart'

// Vider puis remplir la région : un lecteur d'écran ne relit pas un texte identique
const ANNOUNCE_DELAY_MS = 100

/** Ajoute une unité du produit ; désactivé en rupture de stock. Absent sans JavaScript, le panier en dépend. */
const { item, isAvailable } = defineProps<{ item: Cart.Item; isAvailable: boolean }>()

const { add } = useCart()
const t = useDictionary()
const localizePath = useLocalizePath()
const isAdded = ref(false)

const addToCart = () => {
  add(item)
  isAdded.value = false
  window.setTimeout(() => {
    isAdded.value = true
  }, ANNOUNCE_DELAY_MS)
}
</script>

<template>
  <ClientOnly>
    <div class="add-to-cart">
      <Button :disabled="!isAvailable" data-testid="add-to-cart" @click="addToCart">
        {{ t.cart.add }}
      </Button>
      <p role="status" data-testid="add-to-cart-status">
        <template v-if="isAdded">
          {{ format(t.cart.added, { name: item.name }) }}
          <NuxtLink :to="localizePath(CART_PATH)" class="bui-link">{{ t.cart.view }}</NuxtLink>
        </template>
      </p>
    </div>
  </ClientOnly>
</template>

<style scoped>
.add-to-cart {
  margin-block: var(--bui-space-6);
}
</style>
