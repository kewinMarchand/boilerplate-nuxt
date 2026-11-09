<script setup lang="ts">
import { computed } from 'vue'

import { Alert, Button, Skeleton } from '@kewinmarchand/boilerplates-ui/vue'

import { useDictionary } from '@/shared/i18n'
import { Icon } from '@/shared/ui/kit'

import BlogCard from './BlogCard.vue'

import type { Article } from '../domain/article'

const { articles } = defineProps<{
  status: 'pending' | 'error' | 'success'
  articles: Article.Entity[] | undefined
  errorMessage?: string
}>()

const emit = defineEmits<{ retry: [] }>()
const t = useDictionary()

const latestArticles = computed(() => articles?.slice(0, HOME_ARTICLE_COUNT))

const HOME_ARTICLE_COUNT = 3
const BLOG_SIZES = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
const FEATURED_SIZES = '(min-width: 1024px) 66vw, 100vw'
</script>

<template>
  <div
    v-if="status === 'pending'"
    role="status"
    aria-busy="true"
    :aria-label="t.blog.loading"
    class="blog-grid"
    data-testid="home-blog-loading"
  >
    <Skeleton v-for="key in 3" :key="key" height="320px" />
  </div>

  <Alert
    v-else-if="status === 'error'"
    variant="error"
    :prefix="t.ui.alert.error"
    data-testid="home-blog-error"
  >
    {{ errorMessage }}
    <template #action>
      <Button variant="ghost" data-testid="home-blog-retry" @click="emit('retry')">
        <Icon name="rotate-cw" />
        {{ t.blog.retry }}
      </Button>
    </template>
  </Alert>

  <Alert v-else-if="!articles?.length" :prefix="t.ui.alert.info" data-testid="home-blog-empty">
    {{ t.blog.empty }}
  </Alert>

  <div v-else class="blog-grid">
    <BlogCard
      v-for="(article, position) in latestArticles"
      :key="article.id"
      :article="article"
      :sizes="position === 0 ? FEATURED_SIZES : BLOG_SIZES"
      heading="h3"
      data-testid="home-blog-card"
    />
  </div>
</template>

<style scoped>
.blog-grid {
  display: grid;
  gap: var(--bui-space-6);
}

@media (min-width: 640px) {
  .blog-grid {
    grid-template-columns: repeat(12, 1fr);
  }

  .blog-card {
    grid-column: span 6;
  }

  .blog-card:first-child {
    grid-row: span 2;
  }

  .blog-card:first-child :deep(.blog-card-frame) {
    display: flex;
    flex-direction: column;
  }

  .blog-card:first-child :deep(picture) {
    flex-grow: 1;
  }

  .blog-card:first-child :deep(.blog-card-image) {
    height: 100%;
    object-fit: cover;
  }
}

@media (min-width: 1024px) {
  .blog-card {
    grid-column: span 4;
  }

  .blog-card:first-child {
    grid-column: span 8;
  }
}
</style>
