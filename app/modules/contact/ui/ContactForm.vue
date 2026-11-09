<script setup lang="ts">
import { Alert, Button, TextArea, TextField } from '@kewinmarchand/boilerplates-ui/vue'

import { useDictionary } from '@/shared/i18n'

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
const t = useDictionary()
</script>

<template>
  <form novalidate class="contact-form" @submit="onSubmit">
    <input v-if="product" type="hidden" name="product" :value="product" />
    <TextField
      id="contact-nom"
      v-model="name"
      v-bind="nameProps"
      :label="t.contact.name"
      autocomplete="name"
      required
      :required-label="t.ui.required"
      data-testid="contact-name"
    />
    <TextField
      id="contact-email"
      v-model="email"
      v-bind="emailProps"
      :label="t.contact.email"
      type="email"
      autocomplete="email"
      required
      :required-label="t.ui.required"
      data-testid="contact-email"
    />
    <TextArea
      id="contact-message"
      v-model="message"
      v-bind="messageProps"
      :label="t.contact.message"
      required
      :required-label="t.ui.required"
      data-testid="contact-message"
    />
    <Button
      type="submit"
      icon="mail"
      :loading="isPending"
      :loading-label="t.ui.loading"
      data-testid="contact-submit"
    >
      {{ t.contact.send }}
    </Button>
    <div aria-live="polite">
      <Alert
        v-if="isSuccess"
        variant="success"
        :prefix="t.ui.alert.success"
        data-testid="contact-success"
      >
        {{ product ? t.contact.inquirySent : t.contact.sent }}
      </Alert>
      <Alert
        v-if="productError"
        variant="error"
        :prefix="t.ui.alert.error"
        data-testid="contact-product-error"
      >
        {{ productError }}
      </Alert>
      <Alert v-if="isError" variant="error" :prefix="t.ui.alert.error" data-testid="contact-error">
        {{ t.contact.sendError }}
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
