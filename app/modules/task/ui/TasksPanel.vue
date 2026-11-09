<script setup lang="ts">
import { useDictionary } from '@/shared/i18n'

import { useTasks } from './composables/useTasks'
import TaskList from './TaskList.vue'

const { status, data, error, refetch } = useTasks()
const t = useDictionary()
</script>

<template>
  <div aria-live="polite">
    <TaskList
      :status="status"
      :tasks="data"
      v-bind="error ? { errorMessage: t.tasks.loadError } : {}"
      @retry="refetch()"
    />
  </div>
</template>
