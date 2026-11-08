<script setup lang="ts">
import { Alert, Button, TextArea, TextField } from '@kewinmarchand/boilerplates-ui/vue'

import { useContactForm } from './composables/useContactForm'

/** Slug d'une demande de renseignement, `null` pour un message de contact simple. */
const { product = null } = defineProps<{ product?: string | null }>()

const {
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
} = useContactForm(() => product)
</script>

<template>
  <form novalidate class="contact-form" @submit="onSubmit">
    <input v-if="product" type="hidden" name="product" :value="product" />
    <TextField
      id="contact-nom"
      v-model="name"
      v-bind="nameProps"
      label="Nom"
      autocomplete="name"
      required
      data-testid="contact-name"
    />
    <TextField
      id="contact-email"
      v-model="email"
      v-bind="emailProps"
      label="E-mail"
      type="email"
      autocomplete="email"
      required
      data-testid="contact-email"
    />
    <TextArea
      id="contact-message"
      v-model="message"
      v-bind="messageProps"
      label="Message"
      required
      data-testid="contact-message"
    />
    <Button type="submit" icon="mail" :loading="isPending" data-testid="contact-submit">
      Envoyer
    </Button>
    <div aria-live="polite">
      <Alert v-if="isSuccess" variant="success" data-testid="contact-success">
        <template v-if="product">Votre demande de renseignement a bien été envoyée.</template>
        <template v-else>Merci, votre message a bien été envoyé.</template>
      </Alert>
      <Alert v-if="productError" variant="error" data-testid="contact-product-error">
        {{ productError }}
      </Alert>
      <Alert v-if="isError" variant="error" data-testid="contact-error">
        L'envoi a échoué. Réessayez dans quelques instants.
      </Alert>
    </div>
  </form>
</template>

<style scoped>
.contact-form {
  display: flex;
  flex-direction: column;
  gap: var(--bui-space-4);
  max-width: 560px;
}
</style>
