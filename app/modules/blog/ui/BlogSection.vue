<script setup lang="ts">
import BlogGrid from './BlogGrid.vue'
import { useLatestArticles } from './composables/useLatestArticles'

const { status, data, error, refetch } = useLatestArticles()
</script>

<template>
  <section aria-labelledby="home-blog-title" data-testid="home-blog">
    <h2 id="home-blog-title">Derniers articles</h2>
    <div aria-live="polite">
      <BlogGrid
        :status="status"
        :articles="data"
        v-bind="error ? { errorMessage: error.message } : {}"
        @retry="refetch()"
      />
    </div>
    <p class="blog-all">
      <NuxtLink to="/blog" class="bui-link" data-testid="home-blog-all">Tous les articles</NuxtLink>
    </p>
  </section>
</template>

<style scoped>
.blog-all {
  margin-block-start: var(--bui-space-6);
}
</style>
