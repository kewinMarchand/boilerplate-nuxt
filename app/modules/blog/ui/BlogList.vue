<script setup lang="ts">
import { Alert, Button, Skeleton } from '@kewinmarchand/boilerplates-ui/vue'

import { Icon } from '@/shared/ui/kit'

import BlogCard from './BlogCard.vue'

import type { Article } from '../domain/article'

defineProps<{
  status: 'pending' | 'error' | 'success'
  articles: Article.Entity[] | undefined
  errorMessage?: string
}>()

const emit = defineEmits<{ retry: [] }>()

const CARD_SIZES = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
</script>

<template>
  <div
    v-if="status === 'pending'"
    role="status"
    aria-busy="true"
    aria-label="Chargement des articles"
    class="blog-list"
    data-testid="blog-loading"
  >
    <Skeleton v-for="key in 3" :key="key" height="320px" />
  </div>

  <Alert v-else-if="status === 'error'" variant="error" data-testid="blog-error">
    {{ errorMessage }}
    <template #action>
      <Button variant="ghost" data-testid="blog-retry" @click="emit('retry')">
        <Icon name="rotate-cw" />
        Réessayer
      </Button>
    </template>
  </Alert>

  <Alert v-else-if="!articles?.length" data-testid="blog-empty">
    Aucun article pour l'instant. Revenez bientôt.
  </Alert>

  <div v-else class="blog-list" data-testid="blog-list">
    <BlogCard
      v-for="article in articles"
      :key="article.id"
      :article="article"
      :sizes="CARD_SIZES"
      heading="h2"
      data-testid="blog-card"
    />
  </div>
</template>

<style scoped>
.blog-list {
  display: grid;
  gap: var(--bui-space-6);
}

@media (min-width: 640px) {
  .blog-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .blog-list {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
