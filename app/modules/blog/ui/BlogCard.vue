<script setup lang="ts">
import { articleHref } from '@/modules/blog/domain/article'
import { formatPublishedAt } from '@/modules/blog/domain/formatPublishedAt'

import type { Article } from '../domain/article'

defineProps<{ article: Article.Entity; sizes: string; heading: 'h2' | 'h3' }>()
</script>

<template>
  <article class="blog-card">
    <div class="bui-card blog-card-frame">
      <picture v-if="article.image" class="bui-picture">
        <source
          v-for="source in article.image.sources"
          :key="source.type"
          :type="source.type"
          :srcset="source.srcset"
          :sizes="sizes"
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
        <p v-if="article.section" class="blog-card-section" data-testid="article-section">
          {{ article.section.name }}
        </p>
        <component :is="heading" class="type-h3">
          <NuxtLink :to="articleHref(article.slug)" class="blog-card-link">{{
            article.title
          }}</NuxtLink>
        </component>
        <p>{{ article.excerpt }}</p>
        <time :datetime="article.publishedAt" class="blog-card-date">
          {{ formatPublishedAt(article.publishedAt) }}
        </time>
      </div>
    </div>
  </article>
</template>

<style scoped>
.blog-card {
  container-type: inline-size;
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

.blog-card-section {
  margin-block: 0 var(--bui-space-2);
  color: var(--bui-color-text-muted);
  font-size: var(--bui-font-size-body-sm);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
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
</style>
