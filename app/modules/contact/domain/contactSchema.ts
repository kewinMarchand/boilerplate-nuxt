import { z } from 'zod'

/** Messages de validation dans la langue de la page. */
export interface ContactValidationMessages {
  name: string
  email: string
  message: string
}

export const contactSchema = (messages: ContactValidationMessages) =>
  z.object({
    name: z.string().trim().min(2, { error: messages.name }),
    email: z.email({ error: messages.email }),
    message: z.string().trim().min(10, { error: messages.message }),
  })

export declare namespace Contact {
  type FormValues = z.infer<ReturnType<typeof contactSchema>>

  /** Message envoyé : `product` porte le slug d'une demande de renseignement, `null` sinon. */
  type Message = FormValues & { product: string | null }

  /** Produit d'une demande de renseignement, tel que la page de contact l'affiche. */
  interface InquiryProduct {
    slug: string
    name: string
  }
}
