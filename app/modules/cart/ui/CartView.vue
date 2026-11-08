<script setup lang="ts">
import { computed } from 'vue'

import { Button } from '@kewinmarchand/boilerplates-ui/vue'

import { AppBreadcrumb } from '@/shared/ui/layout'

import { MAX_QUANTITY, totalPrice } from '../domain/cart'
import { formatPrice } from '../domain/price'
import { CART_PATH } from './cartPath'
import { useCart } from './composables/useCart'

// Le panier n'existe que dans le navigateur : titre et message sans JavaScript au rendu serveur, contenu au montage
const CATALOG_PATH = '/catalogue'
const productHref = (slug: string) => `/produit/${slug}`

const { lines, changeQuantity, remove } = useCart()
const total = computed(() => formatPrice(totalPrice(lines.value)))

const onQuantityInput = (slug: string, event: Event) => {
  if (!(event.currentTarget instanceof HTMLInputElement)) return
  const quantity = event.currentTarget.valueAsNumber
  if (!Number.isNaN(quantity)) changeQuantity(slug, quantity)
}
</script>

<template>
  <AppBreadcrumb
    :trail="[
      { label: 'Accueil', href: '/' },
      { label: 'Panier', href: CART_PATH },
    ]"
  />
  <h1>Panier</h1>
  <noscript data-allow-mismatch="children"><p>Le panier demande JavaScript.</p></noscript>
  <ClientOnly>
    <p v-if="lines.length === 0" data-testid="cart-empty">
      Votre panier est vide.
      <NuxtLink :to="CATALOG_PATH" class="bui-link">Parcourir le catalogue</NuxtLink>
    </p>
    <template v-else>
      <ul class="cart-lines">
        <li v-for="line in lines" :key="line.slug" class="cart-line" data-testid="cart-line">
          <NuxtLink :to="productHref(line.slug)" class="bui-link cart-line-name">
            {{ line.name }}
          </NuxtLink>
          <span>{{ formatPrice(line.price) }} l’unité</span>
          <label class="bui-field cart-quantity">
            <span class="bui-field__label">Quantité de {{ line.name }}</span>
            <input
              type="number"
              min="1"
              :max="MAX_QUANTITY"
              :value="line.quantity"
              class="bui-field__input"
              data-testid="cart-quantity"
              @input="onQuantityInput(line.slug, $event)"
            />
          </label>
          <span class="cart-line-subtotal">{{ formatPrice(line.price * line.quantity) }}</span>
          <Button
            variant="outline"
            :aria-label="`Retirer ${line.name}`"
            data-testid="cart-remove"
            @click="remove(line.slug)"
          >
            Retirer
          </Button>
        </li>
      </ul>
      <p class="cart-total">
        Total : <span data-testid="cart-total">{{ total }}</span>
      </p>
      <p>La commande en ligne arrive bientôt.</p>
    </template>
  </ClientOnly>
</template>

<style scoped>
.cart-lines {
  display: grid;
  gap: var(--bui-space-4);
  margin: 0;
  padding: 0;
  list-style: none;
}

.cart-line {
  display: grid;
  gap: var(--bui-space-2);
  align-items: center;
  padding-block-end: var(--bui-space-4);
  border-block-end: 1px solid var(--bui-color-border);
}

.cart-line-name,
.cart-line-subtotal {
  font-weight: 700;
}

.cart-quantity {
  max-width: 12rem;
}

.cart-total {
  margin-block: var(--bui-space-6) var(--bui-space-2);
  font-size: var(--bui-font-size-lead);
  font-weight: 700;
}

@media (min-width: 768px) {
  .cart-line {
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) 10rem minmax(0, 1fr) auto;
  }
}
</style>
