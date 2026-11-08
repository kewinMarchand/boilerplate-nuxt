import { z } from 'zod'

export const contactSchema = z.object({
  name: z.string().trim().min(2, { error: 'Indiquez votre nom (2 caractères minimum).' }),
  email: z.email({ error: 'Indiquez une adresse e-mail valide, par exemple nom@domaine.fr.' }),
  message: z
    .string()
    .trim()
    .min(10, { error: 'Votre message doit contenir au moins 10 caractères.' }),
})

export declare namespace Contact {
  type FormValues = z.infer<typeof contactSchema>

  /** Message envoyé : `product` porte le slug d'une demande de renseignement, `null` sinon. */
  type Message = FormValues & { product: string | null }

  /** Produit d'une demande de renseignement, tel que la page de contact l'affiche. */
  interface InquiryProduct {
    slug: string
    name: string
  }
}
