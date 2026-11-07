<script setup lang="ts">
import { Alert } from '@kewinmarchand/boilerplates-ui/vue'

import { RichHtml } from '@/shared/ui/kit'

import { useLegalPage } from './composables/useLegalPage'

import type { LegalPage } from '../domain/legalPage'

const { slug } = defineProps<{
  slug: LegalPage.Slug
  /** Titre affiché tant que la page n'est pas chargée, ou si l'API ne répond pas. */
  fallbackTitle: string
}>()

const { status, data: page, error } = useLegalPage(slug)
</script>

<template>
  <h1>{{ page?.title ?? fallbackTitle }}</h1>
  <Alert v-if="status === 'error'" variant="error" data-testid="legal-error">
    {{ error?.message }}
  </Alert>
  <template v-else-if="page">
    <RichHtml v-if="page.introduction" :html="page.introduction" />
    <section v-for="section in page.sections" :key="section.title" data-testid="legal-section">
      <h2>{{ section.title }}</h2>
      <RichHtml :html="section.html" />
    </section>
  </template>
</template>
