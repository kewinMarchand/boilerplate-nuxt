<script setup lang="ts">
import { computed } from 'vue'

import { Icon } from '@/shared/ui/kit'

import { countItems } from '../domain/cart'
import { CART_PATH } from './cartPath'
import { useCart } from './composables/useCart'

// Nom accessible « Panier, 3 articles » : texte visible et compléments masqués, sans aria-label (axe exige le texte affiché dans le nom)
const { lines } = useCart()
const count = computed(() => countItems(lines.value))
</script>

<template>
  <NuxtLink :to="CART_PATH" class="bui-button bui-button--nav cart-link" data-testid="cart-link">
    <Icon name="shopping-cart" />
    <span class="cart-link-label">Panier</span>
    <template v-if="count > 0">
      <span class="bui-visually-hidden">, </span>
      <span class="cart-link-count" data-testid="cart-count">{{ count }}</span>
      <span class="bui-visually-hidden"> article{{ count > 1 ? 's' : '' }}</span>
    </template>
  </NuxtLink>
</template>

<style scoped>
.cart-link {
  flex-shrink: 0;
  gap: var(--bui-space-1);
  min-width: var(--bui-size-touch);
  padding-inline: var(--bui-space-2);
}

/* Masqué visuellement sous 640 px (icône seule), toujours lu */
.cart-link-label {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.cart-link-count {
  min-width: 1.5em;
  padding-inline: 0.35em;
  border-radius: 999px;
  background: var(--bui-color-on-primary);
  color: var(--bui-color-primary);
  font-size: var(--bui-font-size-body-sm);
  font-weight: 700;
  line-height: 1.5;
  text-align: center;
}

@media (min-width: 640px) {
  .cart-link-label {
    position: static;
    width: auto;
    height: auto;
    overflow: visible;
    clip-path: none;
  }
}
</style>
