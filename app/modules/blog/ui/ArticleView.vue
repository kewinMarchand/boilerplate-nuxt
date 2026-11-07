<script setup lang="ts">
import { computed } from 'vue'
import { useHead, useRoute, useRuntimeConfig } from '#imports'

import { Alert } from '@kewinmarchand/boilerplates-ui/vue'

import { usePageSeo } from '@/shared/seo'
import { largestWebp, RichHtml } from '@/shared/ui/kit'
import { AppBreadcrumb } from '@/shared/ui/layout'

import { articleHref } from '../domain/article'
import { formatPublishedAt } from '../domain/formatPublishedAt'
import { useArticle } from './composables/useArticle'

const IMAGE_SIZES = '(min-width: 800px) 760px, calc(100vw - 32px)'

const route = useRoute()
const slug = String(route.params['slug'])
const { status, data: article, error } = useArticle(slug)
const { siteUrl } = useRuntimeConfig().public

const path = articleHref(slug)
const title = computed(() => article.value?.title ?? 'Article')
const trail = computed(() => [{ label: title.value, href: path }])
const shareImage = computed(() => article.value?.image ?? null)

usePageSeo({
  title,
  description: () => article.value?.excerpt || title.value,
  noindex: () => !article.value,
  breadcrumbTrail: trail,
  publishedTime: () => article.value?.publishedAt,
  image: () => {
    const image = shareImage.value
    return image
      ? {
          path: largestWebp(image),
          width: image.width,
          height: image.height,
          alt: image.alt || title.value,
        }
      : undefined
  },
  jsonLd: () =>
    article.value
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: article.value.title,
            description: article.value.excerpt,
            datePublished: article.value.publishedAt,
            url: new URL(path, siteUrl).href,
            ...(article.value.image && { image: largestWebp(article.value.image) }),
            inLanguage: 'fr-FR',
          },
        ]
      : [],
})

// Image LCP de la fiche : préchargée en tête de page
useHead({
  link: () => {
    const first = article.value?.image?.sources[0]
    return first
      ? [
          {
            rel: 'preload',
            as: 'image',
            type: first.type,
            imagesrcset: first.srcset,
            imagesizes: IMAGE_SIZES,
            fetchpriority: 'high',
          },
        ]
      : []
  },
})
</script>

<template>
  <AppBreadcrumb :trail="[{ label: 'Accueil', href: '/' }, ...trail]" />
  <template v-if="status === 'error'">
    <h1>Article</h1>
    <Alert variant="error" data-testid="article-error">{{ error?.message }}</Alert>
  </template>
  <article v-else-if="article" class="article" data-testid="article-page">
    <h1 data-testid="article-title">{{ article.title }}</h1>
    <p class="article-date">
      Publié le
      <time :datetime="article.publishedAt">{{ formatPublishedAt(article.publishedAt) }}</time>
    </p>
    <picture v-if="article.image">
      <source
        v-for="source in article.image.sources"
        :key="source.type"
        :type="source.type"
        :srcset="source.srcset"
        :sizes="IMAGE_SIZES"
      />
      <img
        :src="article.image.src"
        :alt="article.image.alt"
        :width="article.image.width"
        :height="article.image.height"
        fetchpriority="high"
        decoding="async"
        class="article-image"
      />
    </picture>
    <p v-if="article.excerpt" class="article-excerpt">{{ article.excerpt }}</p>
    <RichHtml :html="article.html" data-testid="article-body" />
    <p class="article-back"><NuxtLink to="/">Retour à l’accueil</NuxtLink></p>
  </article>
</template>

<style scoped>
.article {
  max-width: 760px;
}

.article-date {
  margin-block-end: var(--bui-space-6);
  color: var(--bui-color-text-muted);
  font-size: var(--bui-font-size-body-sm);
}

.article-image {
  display: block;
  width: 100%;
  height: auto;
  border-radius: var(--bui-radius-md);
}

.article-excerpt {
  margin-block: var(--bui-space-6);
  font-size: var(--bui-font-size-lead);
}

.article-back {
  margin-block-start: var(--bui-space-12);
}
</style>
