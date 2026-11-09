<script setup lang="ts">
import { usePageDictionary } from '@/shared/i18n/route'

import { ArticleView } from '@/modules/blog'

await usePageDictionary(['blog'])
</script>

<template>
  <ArticleView />
</template>
