<script setup lang="ts">
import BlogList from './BlogList.vue'
import { useLatestArticles } from './composables/useLatestArticles'

const { status, data, error, refetch } = useLatestArticles()
</script>

<template>
  <h1>Blog</h1>
  <div aria-live="polite">
    <BlogList
      :status="status"
      :articles="data"
      v-bind="error ? { errorMessage: error.message } : {}"
      @retry="refetch()"
    />
  </div>
</template>
