<script setup lang="ts">
import { useDictionary } from '@/shared/i18n'
import { usePageSeo } from '@/shared/seo'

import { TasksView } from '@/modules/task'

const t = useDictionary()

usePageSeo({ title: t.meta.tasks.title, description: t.meta.tasks.description })
</script>

<template>
  <TasksView />
</template>
