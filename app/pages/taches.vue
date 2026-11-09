<script setup lang="ts">
import { useDictionary } from '@/shared/i18n'
import { usePageDictionary } from '@/shared/i18n/route'
import { usePageSeo } from '@/shared/seo'

import { TasksView } from '@/modules/task'

await usePageDictionary(['tasks', 'meta.tasks'])
const t = useDictionary()

usePageSeo({ title: t.meta.tasks.title, description: t.meta.tasks.description })
</script>

<template>
  <TasksView />
</template>
