import { useMutation } from '@tanstack/vue-query'
import { useForm } from 'vee-validate'
import { computed, ref, toValue } from 'vue'

import { toTypedSchema } from '@/shared/forms'
import { useDictionary, useLocale } from '@/shared/i18n'

import { contactSchema } from '@/modules/contact/domain/contactSchema'
import { useContactRepository } from '@/modules/contact/infrastructure/contactRepository'

import type { Contact } from '@/modules/contact/domain/contactSchema'
import type { PublicPathState } from 'vee-validate'
import type { MaybeRefOrGetter } from 'vue'

const DEFAULT_VALUES: Contact.FormValues = { name: '', email: '', message: '' }

const FIELD_CONFIG = {
  validateOnModelUpdate: false,
  // Premier message d'erreur, relié au champ par le composant de la bibliothèque (aria-invalid, aria-describedby)
  props: (state: PublicPathState<string>) => ({ error: state.errors[0] }),
}

/** `product` : slug d'une demande de renseignement, envoyé avec le message ; `null` pour un message simple. */
export const useContactForm = (product: MaybeRefOrGetter<string | null>) => {
  const repository = useContactRepository()
  const t = useDictionary()
  const { locale } = useLocale()
  const { defineField, handleSubmit, resetForm, setFieldError } = useForm({
    validationSchema: toTypedSchema(contactSchema(t.contact.validation)),
    initialValues: DEFAULT_VALUES,
  })

  const [name, nameProps] = defineField('name', FIELD_CONFIG)
  const [email, emailProps] = defineField('email', FIELD_CONFIG)
  const [message, messageProps] = defineField('message', FIELD_CONFIG)

  // Produit retiré entre l'affichage et l'envoi : pas de champ où poser la violation, message au niveau du formulaire
  const productError = ref<string>()

  const { mutate, isPending, isError, data } = useMutation({
    // Les messages de validation de l'API suivent la langue de la page
    mutationFn: (body: Contact.Message) => repository.send(body, locale),
    onMutate: () => {
      productError.value = undefined
    },
    onSuccess: (result) => {
      if (result.status === 'sent') return resetForm({ values: DEFAULT_VALUES })
      for (const { field, message } of result.fieldErrors) {
        if (field === 'product') productError.value = message
        else setFieldError(field, message)
      }
    },
  })
  const isSuccess = computed(() => data.value?.status === 'sent')

  const onSubmit = handleSubmit((values) => mutate({ ...values, product: toValue(product) }))

  return {
    name,
    nameProps,
    email,
    emailProps,
    message,
    messageProps,
    isPending,
    isSuccess,
    isError,
    productError,
    onSubmit,
  }
}
