<script setup lang="ts">
import { computed } from 'vue'

import { Button } from '@kewinmarchand/boilerplates-ui/vue'

import { format, useDictionary, useLocale, useLocalizePath } from '@/shared/i18n'
import { AppBreadcrumb } from '@/shared/ui/layout'

import { lineIn, MAX_QUANTITY, totalPrice } from '../domain/cart'
import { formatPrice } from '../domain/price'
import { CART_PATH } from './cartPath'
import { useCart } from './composables/useCart'
import { useFocusAfterRemoval } from './composables/useFocusAfterRemoval'

// Le panier n'existe que dans le navigateur : titre et message sans JavaScript au rendu serveur, contenu au montage
const CATALOG_PATH = '/catalogue'
const productHref = (slug: string) => `/produit/${slug}`

const { lines, changeQuantity, remove } = useCart()
const t = useDictionary()
const { locale } = useLocale()
const localizePath = useLocalizePath()
const price = (cents: number) => formatPrice(cents, t.language.tag)
const total = computed(() => price(totalPrice(lines.value)))
const localizedLines = computed(() =>
  lines.value.map((line) => ({ ...line, ...lineIn(line, locale) })),
)
const { markRemoved } = useFocusAfterRemoval(() => lines.value.length)

const removeLine = (index: number, id: string) => {
  markRemoved(index)
  remove(id)
}

const onQuantityInput = (id: string, event: Event) => {
  if (!(event.currentTarget instanceof HTMLInputElement)) return
  const quantity = event.currentTarget.valueAsNumber
  if (!Number.isNaN(quantity)) changeQuantity(id, quantity)
}
</script>

<template>
  <AppBreadcrumb
    :trail="[
      { label: t.nav.home, href: '/' },
      { label: t.cart.title, href: CART_PATH },
    ]"
  />
  <h1>{{ t.cart.title }}</h1>
  <noscript data-allow-mismatch="children"
    ><p>{{ t.cart.noScript }}</p></noscript
  >
  <ClientOnly>
    <p v-if="lines.length === 0" ref="cartEmpty" tabindex="-1" data-testid="cart-empty">
      {{ t.cart.empty }}
      <NuxtLink :to="localizePath(CATALOG_PATH)" class="bui-link">{{
        t.cart.browseCatalog
      }}</NuxtLink>
    </p>
    <template v-else>
      <ul ref="cartLines" class="cart-lines">
        <li
          v-for="(line, index) in localizedLines"
          :key="line.id"
          class="cart-line"
          data-testid="cart-line"
        >
          <NuxtLink :to="localizePath(productHref(line.slug))" class="bui-link cart-line-name">
            {{ line.name }}
          </NuxtLink>
          <span>{{ format(t.cart.unitPrice, { price: price(line.price) }) }}</span>
          <label class="bui-field cart-quantity">
            <span class="bui-field__label">{{
              format(t.cart.quantityOf, { name: line.name })
            }}</span>
            <input
              type="number"
              min="1"
              :max="MAX_QUANTITY"
              :value="line.quantity"
              class="bui-field__input"
              data-testid="cart-quantity"
              @input="onQuantityInput(line.id, $event)"
            />
          </label>
          <span class="cart-line-subtotal">{{ price(line.price * line.quantity) }}</span>
          <Button
            variant="outline"
            :aria-label="format(t.cart.removeItem, { name: line.name })"
            data-testid="cart-remove"
            @click="removeLine(index, line.id)"
          >
            {{ t.cart.remove }}
          </Button>
        </li>
      </ul>
      <p class="cart-total">
        {{ t.cart.total }} <span data-testid="cart-total">{{ total }}</span>
      </p>
      <p>{{ t.cart.soon }}</p>
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
