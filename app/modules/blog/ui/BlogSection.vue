<script setup lang="ts">
import { useDictionary, useLocalizePath } from '@/shared/i18n'

import BlogGrid from './BlogGrid.vue'
import { useLatestArticles } from './composables/useLatestArticles'

const { status, data, error, refetch } = useLatestArticles()
const t = useDictionary()
const localizePath = useLocalizePath()
</script>

<template>
  <section aria-labelledby="home-blog-title" data-testid="home-blog">
    <h2 id="home-blog-title">{{ t.blog.latest }}</h2>
    <div aria-live="polite">
      <BlogGrid
        :status="status"
        :articles="data"
        v-bind="error ? { errorMessage: t.blog.latestError } : {}"
        @retry="refetch()"
      />
    </div>
    <p class="blog-all">
      <NuxtLink :to="localizePath('/blog')" class="bui-link" data-testid="home-blog-all">{{
        t.blog.all
      }}</NuxtLink>
    </p>
  </section>
</template>

<style scoped>
.blog-all {
  margin-block-start: var(--bui-space-6);
}
</style>
