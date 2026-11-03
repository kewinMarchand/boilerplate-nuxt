<script setup lang="ts">
import { Alert } from '@kewinmarchand/boilerplates-ui/vue'

import { useLegalPage } from './composables/useLegalPage'

import type { LegalPage } from '../domain/legalPage'

const { slug } = defineProps<{
  slug: LegalPage.Slug
  /** Titre affiché tant que la page n'est pas chargée, ou si l'API ne répond pas. */
  fallbackTitle: string
}>()

// HTML injecté tel quel (`v-html`) : l'API échappe le HTML saisi dans l'admin et retire les liens dangereux
const { status, data: page, error } = useLegalPage(slug)
</script>

<template>
  <h1>{{ page?.title ?? fallbackTitle }}</h1>
  <Alert v-if="status === 'error'" variant="error" data-testid="legal-error">
    {{ error?.message }}
  </Alert>
  <template v-else-if="page">
    <div v-if="page.introduction" class="legal-html" v-html="page.introduction" />
    <section v-for="section in page.sections" :key="section.title" data-testid="legal-section">
      <h2>{{ section.title }}</h2>
      <div class="legal-html" v-html="section.html" />
    </section>
  </template>
</template>

<style scoped>
/* HTML venu de l'API, sans classe : les liens reprennent `bui-link` de la bibliothèque */
.legal-html :deep(a) {
  color: var(--bui-color-primary);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.2em;
}

.legal-html :deep(a:hover) {
  color: var(--bui-color-primary-dark);
  text-decoration-thickness: 2px;
}

.legal-html :deep(a:focus-visible) {
  border-radius: 2px;
  outline: var(--bui-focus-width) solid var(--bui-color-primary);
  outline-offset: var(--bui-focus-offset);
}
</style>
