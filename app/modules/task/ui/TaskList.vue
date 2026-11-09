<script setup lang="ts">
import { Alert, Button, Skeleton } from '@kewinmarchand/boilerplates-ui/vue'

import { useDictionary } from '@/shared/i18n'
import { Icon } from '@/shared/ui/kit'

import type { Task } from '../domain/task'

defineProps<{
  status: 'pending' | 'error' | 'success'
  tasks: Task.Entity[] | undefined
  errorMessage?: string
}>()

const emit = defineEmits<{ retry: [] }>()
const t = useDictionary()
</script>

<template>
  <div
    v-if="status === 'pending'"
    role="status"
    aria-busy="true"
    :aria-label="t.tasks.loading"
    class="tasks-loading"
    data-testid="tasks-loading"
  >
    <Skeleton v-for="key in 3" :key="key" height="48px" />
  </div>

  <Alert
    v-else-if="status === 'error'"
    variant="error"
    :prefix="t.ui.alert.error"
    data-testid="tasks-error"
  >
    {{ errorMessage }}
    <template #action>
      <Button variant="ghost" data-testid="tasks-retry" @click="emit('retry')">
        <Icon name="rotate-cw" />
        {{ t.tasks.retry }}
      </Button>
    </template>
  </Alert>

  <Alert v-else-if="!tasks?.length" :prefix="t.ui.alert.info" data-testid="tasks-empty">
    {{ t.tasks.empty }}
  </Alert>

  <ul v-else class="tasks-list" data-testid="tasks-list">
    <li v-for="task in tasks" :key="task.id" class="tasks-item" data-testid="tasks-item">
      <Icon :name="task.done ? 'circle-check' : 'circle'" />
      <div>
        <p class="tasks-title">{{ task.title }}</p>
        <p class="tasks-status">{{ task.done ? t.tasks.done : t.tasks.todo }}</p>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.tasks-loading {
  display: flex;
  flex-direction: column;
  gap: var(--bui-space-2);
}

.tasks-list {
  margin: 0;
  padding: var(--bui-space-2) 0;
  list-style: none;
}

.tasks-item {
  display: flex;
  align-items: center;
  gap: var(--bui-space-4);
  padding: var(--bui-space-2) var(--bui-space-4);
}

.tasks-title,
.tasks-status {
  margin: 0;
}

.tasks-status {
  color: var(--bui-color-text-muted);
  font-size: var(--bui-font-size-body-sm);
}
</style>
