import { ApiError } from '@/shared/api/client'
import { useApiClient } from '@/shared/api/useApiClient'

import { toFieldErrors, toInquiryProduct } from './http/contactTranslation'

import type { Contact } from '../domain/contactSchema'
import type { FieldError } from './http/contactTranslation'

export type ContactSendResult =
  { status: 'sent' } | { status: 'invalid'; fieldErrors: FieldError[] }

/** Dépôt de la requête en cours, à créer dans un `setup`. L'envoi part du navigateur. */
export const useContactRepository = () => {
  const api = useApiClient()
  return {
    send: async (body: Contact.Message): Promise<ContactSendResult> => {
      const { error, response } = await api.POST('/api/contact_messages', { body })
      if (response.status === 422) return { status: 'invalid', fieldErrors: toFieldErrors(error) }
      if (!response.ok) throw new ApiError(response)
      return { status: 'sent' }
    },
    /** `null` si l'API ne connaît pas le produit (404). */
    findInquiryProduct: async (slug: string): Promise<Contact.InquiryProduct | null> => {
      const { data, response } = await api.GET('/api/products/{slug}', {
        params: { path: { slug } },
      })
      if (response.status === 404) return null
      if (!data) throw new ApiError(response)
      return toInquiryProduct(data)
    },
  }
}
