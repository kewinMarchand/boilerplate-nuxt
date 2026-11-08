<script setup lang="ts">
import { Alert, Button, Skeleton } from '@kewinmarchand/boilerplates-ui/vue'

import { Icon } from '@/shared/ui/kit'

import { articleHref } from '@/modules/blog/domain/article'
import { formatPublishedAt } from '@/modules/blog/domain/formatPublishedAt'

import type { Article } from '../domain/article'

defineProps<{
  status: 'pending' | 'error' | 'success'
  articles: Article.Entity[] | undefined
  errorMessage?: string
}>()

const emit = defineEmits<{ retry: [] }>()

const BLOG_SIZES = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
const FEATURED_SIZES = '(min-width: 1024px) 66vw, 100vw'
</script>

<template>
  <div
    v-if="status === 'pending'"
    role="status"
    aria-busy="true"
    aria-label="Chargement des articles"
    class="blog-grid"
    data-testid="home-blog-loading"
  >
    <Skeleton v-for="key in 3" :key="key" height="320px" />
  </div>

  <Alert v-else-if="status === 'error'" variant="error" data-testid="home-blog-error">
    {{ errorMessage }}
    <template #action>
      <Button variant="ghost" data-testid="home-blog-retry" @click="emit('retry')">
        <Icon name="rotate-cw" />
        Réessayer
      </Button>
    </template>
  </Alert>

  <Alert v-else-if="!articles?.length" data-testid="home-blog-empty">
    Aucun article pour l'instant. Revenez bientôt.
  </Alert>

  <div v-else class="blog-grid">
    <article
      v-for="(article, position) in articles"
      :key="article.id"
      class="blog-card"
      data-testid="home-blog-card"
    >
      <div class="bui-card blog-card-frame">
        <picture v-if="article.image">
          <source
            v-for="source in article.image.sources"
            :key="source.type"
            :type="source.type"
            :srcset="source.srcset"
            :sizes="position === 0 ? FEATURED_SIZES : BLOG_SIZES"
          />
          <img
            :src="article.image.src"
            :alt="article.image.alt"
            :width="article.image.width"
            :height="article.image.height"
            loading="lazy"
            decoding="async"
            class="blog-card-image"
          />
        </picture>
        <div class="blog-card-body">
          <h3>
            <NuxtLink :to="articleHref(article.slug)" class="blog-card-link">{{
              article.title
            }}</NuxtLink>
          </h3>
          <p>{{ article.excerpt }}</p>
          <time :datetime="article.publishedAt" class="blog-card-date">
            {{ formatPublishedAt(article.publishedAt) }}
          </time>
        </div>
      </div>
    </article>
  </div>
</template>

<style scoped>
.blog-grid {
  display: grid;
  gap: var(--bui-space-6);
}

.blog-card-frame {
  position: relative;
  height: 100%;
}

/* Lien étiré sur toute la carte : un seul lien, nommé par le titre */
.blog-card-link::after {
  content: '';
  position: absolute;
  inset: 0;
}

.blog-card-date {
  color: var(--bui-color-text-muted);
  font-size: var(--bui-font-size-body-sm);
}

.blog-card {
  container-type: inline-size;
}

.blog-card-image {
  display: block;
  width: 100%;
  height: auto;
}

.blog-card-body {
  padding: 16px;
}

@container (min-width: 360px) {
  .blog-card-body {
    padding: 24px;
  }
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

  .blog-card:first-child .blog-card-frame {
    display: flex;
    flex-direction: column;
  }

  .blog-card:first-child picture {
    flex-grow: 1;
  }

  .blog-card:first-child .blog-card-image {
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
