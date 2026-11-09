<script setup lang="ts">
import { computed } from 'vue'
import { useHead, useRoute, useRuntimeConfig } from '#imports'

import { Alert } from '@kewinmarchand/boilerplates-ui/vue'

import { format, useDictionary, useLocalizePath } from '@/shared/i18n'
import { usePageSeo } from '@/shared/seo'
import { largestWebp, RichHtml } from '@/shared/ui/kit'
import { AppBreadcrumb } from '@/shared/ui/layout'

import { articleHref } from '../domain/article'
import { formatDuration } from '../domain/formatDuration'
import { formatPublishedAt } from '../domain/formatPublishedAt'
import { useArticle } from './composables/useArticle'

const BLOG_PATH = '/blog'
const IMAGE_SIZES = '(min-width: 800px) 760px, calc(100vw - 32px)'

const route = useRoute()
const slug = String(route.params['slug'])
const { status, data: article } = useArticle(slug)
const t = useDictionary()
const localizePath = useLocalizePath()
const { siteUrl } = useRuntimeConfig().public

const path = articleHref(slug)
const title = computed(() => article.value?.title ?? t.blog.articleFallbackTitle)
const trail = computed(() => [
  { label: t.blog.title, href: BLOG_PATH },
  { label: title.value, href: path },
])
const shareImage = computed(() => article.value?.image ?? null)

usePageSeo({
  title,
  adminTitle: () => article.value?.metaTitle ?? '',
  description: () => article.value?.metaDescription || article.value?.excerpt || title.value,
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
            url: new URL(localizePath(path), siteUrl).href,
            ...(article.value.image && { image: largestWebp(article.value.image) }),
            inLanguage: t.language.tag,
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
  <AppBreadcrumb :trail="[{ label: t.nav.home, href: '/' }, ...trail]" />
  <template v-if="status === 'error'">
    <h1>{{ t.blog.articleFallbackTitle }}</h1>
    <Alert variant="error" data-testid="article-error">{{ t.blog.articleError }}</Alert>
  </template>
  <article v-else-if="article" class="article" data-testid="article-page">
    <h1 data-testid="article-title">{{ article.title }}</h1>
    <p v-if="article.section || article.format" class="article-terms">
      <span v-if="article.section" data-testid="article-section">{{ article.section.name }}</span>
      <span v-if="article.section && article.format" aria-hidden="true"> · </span>
      <span v-if="article.format" data-testid="article-format">{{ article.format.name }}</span>
    </p>
    <p class="article-date">
      {{ t.blog.publishedOn }}
      <time :datetime="article.publishedAt">{{
        formatPublishedAt(article.publishedAt, t.language.tag)
      }}</time>
    </p>
    <picture v-if="article.image" class="bui-picture">
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
    <figure v-if="article.audio" class="article-audio" data-testid="article-audio-block">
      <figcaption>
        {{ format(t.blog.audio, { duration: formatDuration(article.audio.durationSeconds) }) }}
        <template v-if="article.speaker">
          · <span data-testid="article-speaker">{{ article.speaker }}</span>
        </template>
      </figcaption>
      <audio
        controls
        preload="none"
        :aria-label="format(t.blog.listen, { title: article.title })"
        class="article-audio-player"
        data-testid="article-audio"
      >
        <source :src="article.audio.src" :type="article.audio.type" />
        <a :href="article.audio.src" class="bui-link">{{ t.blog.download }}</a>
      </audio>
    </figure>
    <RichHtml :html="article.html" data-testid="article-body" />
    <p class="article-back">
      <NuxtLink :to="localizePath(BLOG_PATH)" data-testid="article-blog-link">{{
        t.blog.all
      }}</NuxtLink>
    </p>
  </article>
</template>

<style scoped>
.article {
  max-width: 760px;
}

.article-terms {
  margin-block: 0 var(--bui-space-2);
  font-weight: 600;
}

.article-audio {
  margin: var(--bui-space-6) 0;
}

.article-audio figcaption {
  margin-block-end: var(--bui-space-2);
  color: var(--bui-color-text-muted);
  font-size: var(--bui-font-size-body-sm);
}

.article-audio-player {
  display: block;
  width: 100%;
}

.article-date {
  margin-block-end: var(--bui-space-6);
  color: var(--bui-color-text-muted);
  font-size: var(--bui-font-size-body-sm);
}

.bui-picture {
  border-radius: var(--bui-radius-md);
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
