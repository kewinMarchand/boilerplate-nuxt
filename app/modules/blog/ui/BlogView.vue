<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#imports'

import { useDictionary, useLocalizePath } from '@/shared/i18n'

import BlogList from './BlogList.vue'
import { useArticleSections } from './composables/useArticleSections'
import { useLatestArticles } from './composables/useLatestArticles'

const BLOG_PATH = '/blog'

const route = useRoute()
const t = useDictionary()
const localizePath = useLocalizePath()
const section = computed(() => {
  const value = route.query['rubrique']
  return typeof value === 'string' && value !== '' ? value : undefined
})
const { status, data, error, refetch } = useLatestArticles(section)
const { data: sections } = useArticleSections()

const sectionLinks = computed(() => [
  { slug: undefined, name: t.blog.allSections, href: localizePath(BLOG_PATH) },
  ...(sections.value ?? []).map(({ slug, name }) => ({
    slug,
    name,
    href: localizePath(`${BLOG_PATH}?rubrique=${encodeURIComponent(slug)}`),
  })),
])
</script>

<template>
  <h1>{{ t.blog.title }}</h1>
  <!-- aria-current posé à la main : NuxtLink ignore la requête et marquerait « Toutes » comme actif partout -->
  <nav
    v-if="sections?.length"
    :aria-label="t.blog.sections"
    class="blog-sections"
    data-testid="blog-sections"
  >
    <ul class="blog-sections-list">
      <li v-for="link in sectionLinks" :key="link.href">
        <NuxtLink v-slot="{ navigate }" :to="link.href" custom>
          <a
            :href="link.href"
            class="bui-link blog-section-link"
            :aria-current="link.slug === section ? 'page' : undefined"
            data-testid="blog-section-link"
            @click="navigate"
            >{{ link.name }}</a
          >
        </NuxtLink>
      </li>
    </ul>
  </nav>
  <div aria-live="polite">
    <BlogList
      :status="status"
      :articles="data"
      v-bind="error ? { errorMessage: t.blog.latestError } : {}"
      @retry="refetch()"
    />
  </div>
</template>

<style scoped>
.blog-sections-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--bui-space-2) var(--bui-space-6);
  margin: 0 0 var(--bui-space-6);
  padding: 0;
  list-style: none;
}

.blog-section-link {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
}

.blog-section-link[aria-current='page'] {
  font-weight: 700;
}
</style>
