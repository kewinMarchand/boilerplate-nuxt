import { onBeforeUnmount, onMounted, ref } from 'vue'

import { addItem, removeItem, setQuantity } from '@/modules/cart/domain/cart'
import {
  currentRawCart,
  parseCart,
  saveCart,
  subscribeToCart,
} from '@/modules/cart/infrastructure/cartStorage'

import type { Cart } from '@/modules/cart/domain/cart'

/** Panier du navigateur : vide au rendu serveur, lu au montage, synchronisé entre composants et onglets. */
export const useCart = () => {
  const lines = ref<Cart.Line[]>([])
  let unsubscribe: (() => void) | undefined

  onMounted(() => {
    const read = () => {
      lines.value = parseCart(currentRawCart())
    }
    read()
    unsubscribe = subscribeToCart(read)
  })

  onBeforeUnmount(() => unsubscribe?.())

  const update = (change: (current: Cart.Line[]) => Cart.Line[]) =>
    saveCart(change(parseCart(currentRawCart())))

  return {
    lines,
    add: (item: Cart.Item) => update((current) => addItem(current, item)),
    changeQuantity: (id: string, quantity: number) =>
      update((current) => setQuantity(current, id, quantity)),
    remove: (id: string) => update((current) => removeItem(current, id)),
  }
}
