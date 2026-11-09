<script setup lang="ts">
import { useDictionary } from '@/shared/i18n'

import TasksPanel from './TasksPanel.vue'

const t = useDictionary()
</script>

<template>
  <h1>{{ t.tasks.title }}</h1>
  <p>{{ t.tasks.intro }}</p>
  <TasksPanel />
</template>
