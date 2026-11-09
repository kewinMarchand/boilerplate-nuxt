import { useQuery } from '@tanstack/vue-query'
import { computed, toValue, watch } from 'vue'
import { createError, showError } from '#imports'

import { useLocale } from '@/shared/i18n'

import { productAlternates } from '@/modules/catalog/domain/catalog'
import { ProductLoadError } from '@/modules/catalog/application/ProductLoadError'
import { useCatalogUseCases } from '@/modules/catalog/application/useCatalogUseCases'

import type { Catalog } from '@/modules/catalog/domain/catalog'
import type { MaybeRefOrGetter, Ref } from 'vue'

const NOT_FOUND = { statusCode: 404, fatal: true }

/** Requête d'une fiche, partagée par la page et le sélecteur de langue ; inactive sans slug. */
const useProductQuery = (slug: MaybeRefOrGetter<string | undefined>) => {
  const { loadProduct } = useCatalogUseCases()
  return useQuery({
    queryKey: ['product', computed(() => toValue(slug))],
    queryFn: async () => {
      try {
        return await loadProduct(toValue(slug) ?? '')
      } catch (error) {
        console.error(error)
        throw new ProductLoadError({ cause: error })
      }
    },
    enabled: () => toValue(slug) !== undefined,
  })
}

/**
 * Fiche d'un produit ; slug inconnu de l'API : 404, au rendu serveur comme dans le navigateur.
 * À attendre dans le `setup` : un `onServerPrefetch` décalerait les `useId` du carrousel des produits similaires.
 */
export const useProduct = async (slug: string) => {
  const query = useProductQuery(slug)
  // Au rendu serveur, le watch immédiat ne voit que la donnée pas encore chargée : le 404 y part de l'attente ci-dessous
  watch(
    query.data,
    (product) => {
      if (product === null) showError(NOT_FOUND)
    },
    { immediate: true },
  )
  if (import.meta.server) {
    await query.suspense()
    if (query.data.value === null) throw createError(NOT_FOUND)
  }
  return query
}

/**
 * La fiche de `slug` dans chaque langue (sélecteur, `hreflang`), par la même requête que la page ;
 * aucune hors d'une fiche, pour un produit inconnu ou une API en erreur. À attendre dans le `setup`.
 */
export const useProductAlternates = async (slug: MaybeRefOrGetter<string | undefined>) => {
  const query = useProductQuery(slug)
  // Attente des deux côtés : une frontière asynchrone serveur seulement décalerait les `useId`
  await (import.meta.server && toValue(slug) !== undefined
    ? query.suspense().catch(() => null)
    : Promise.resolve())
  return computed(() => (query.data.value ? productAlternates(query.data.value) : []))
}

/**
 * Slug et nom de la fiche dans chaque langue du site, pour une ligne du panier affichée dans une autre
 * langue ; lus au rendu serveur et transmis par le payload, aucune lecture sans vente ni sur un site
 * monolingue. À attendre dans le `setup`.
 */
export const useProductTranslations = async (
  product: Readonly<Ref<Catalog.ProductDetail | null | undefined>>,
  salesEnabled: boolean,
) => {
  const { loadProductTranslations } = useCatalogUseCases()
  const { locale } = useLocale()
  const enabled = computed(() => salesEnabled && (product.value?.alternates.length ?? 0) > 0)
  const query = useQuery({
    queryKey: ['product-translations', computed(() => product.value?.slug)],
    queryFn: () => (product.value ? loadProductTranslations(product.value, locale) : []),
    enabled,
  })
  // Requête désactivée : `suspense()` ne rendrait jamais la main
  await (import.meta.server && enabled.value ? query.suspense() : Promise.resolve())
  return computed(() => query.data.value ?? [])
}
