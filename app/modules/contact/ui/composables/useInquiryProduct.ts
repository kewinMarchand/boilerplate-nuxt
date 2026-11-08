import { useQuery } from '@tanstack/vue-query'
import { computed } from 'vue'

import { useContactRepository } from '@/modules/contact/infrastructure/contactRepository'

import type { Ref } from 'vue'

/**
 * Produit d'une demande de renseignement, lu au rendu serveur. Slug absent, inconnu de l'API ou API en erreur :
 * `null`, la page reste un formulaire de contact simple. À attendre dans le `setup`.
 */
export const useInquiryProduct = async (slug: Readonly<Ref<string | null>>) => {
  const repository = useContactRepository()
  const query = useQuery({
    queryKey: ['contact-product', slug],
    queryFn: () =>
      slug.value
        ? repository.findInquiryProduct(slug.value).catch((error: unknown) => {
            console.error(error)
            return null
          })
        : null,
  })
  await (import.meta.server ? query.suspense() : Promise.resolve())
  return computed(() => query.data.value ?? null)
}
