import type { Contact } from '@/modules/contact/domain/contactSchema'
import type { components } from '@/shared/api/client'

type ApiErrorDto = components['schemas']['ConstraintViolation'] | components['schemas']['Error']
type ProductDetailDto = components['schemas']['ProductDetail']
type MessageField = keyof Contact.Message

export interface FieldError {
  field: MessageField
  message: string
}

const FIELDS: MessageField[] = ['name', 'email', 'message', 'product']

const isField = (path: string): path is MessageField => FIELDS.some((field) => field === path)

export const toInquiryProduct = (
  dto: Pick<ProductDetailDto, 'slug' | 'name'>,
): Contact.InquiryProduct => ({
  slug: dto.slug,
  name: dto.name,
})

/** Violations 422 vers les erreurs de champ. Les messages de l'API sont déjà en français. */
export const toFieldErrors = (dto: ApiErrorDto | undefined): FieldError[] =>
  (dto && 'violations' in dto ? (dto.violations ?? []) : []).flatMap(({ propertyPath, message }) =>
    isField(propertyPath) ? [{ field: propertyPath, message }] : [],
  )
