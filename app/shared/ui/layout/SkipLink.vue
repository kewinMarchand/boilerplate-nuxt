<script setup lang="ts">
import { useDictionary } from '@/shared/i18n'

const t = useDictionary()
</script>

<template>
  <a href="#main" data-testid="layout-skip-link" class="skip-link">{{ t.layout.skipLink }}</a>
</template>

<style scoped>
.skip-link {
  position: absolute;
  left: 8px;
  top: -64px;
  z-index: var(--app-z-skip-link);
  padding: var(--bui-space-3);
  border-radius: var(--bui-radius-md);
  background: var(--bui-color-surface);
  color: var(--bui-color-primary);
}

.skip-link:focus-visible {
  top: 8px;
  outline: 3px solid currentColor;
}
</style>
