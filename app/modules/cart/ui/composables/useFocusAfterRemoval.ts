import { useTemplateRef, watch } from 'vue'

/**
 * Après un retrait, le focus va au bouton « Retirer » de la ligne qui prend la place, sinon de la
 * précédente, sinon au message de panier vide : sans cela, il retombe en haut de la page.
 * Le composant pose `ref="cartLines"` sur la liste et `ref="cartEmpty"` sur le message.
 */
export const useFocusAfterRemoval = (lineCount: () => number) => {
  const list = useTemplateRef<HTMLUListElement>('cartLines')
  const empty = useTemplateRef<HTMLParagraphElement>('cartEmpty')
  let removedIndex: number | null = null

  watch(
    lineCount,
    (count) => {
      if (removedIndex === null) return
      const buttons = list.value?.querySelectorAll<HTMLButtonElement>(':scope > li button')
      const target = buttons?.[Math.min(removedIndex, count - 1)] ?? empty.value
      target?.focus()
      removedIndex = null
    },
    { flush: 'post' },
  )

  return {
    markRemoved: (index: number) => {
      removedIndex = index
    },
  }
}
