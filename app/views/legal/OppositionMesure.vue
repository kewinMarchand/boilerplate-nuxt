<script setup lang="ts">
import { useId } from 'vue'

import { useDictionary } from '@/shared/i18n'
import { useOppositionMesure } from '@/shared/observability'

const t = useDictionary()
const { refusee, changer } = useOppositionMesure()
const inputId = useId()
</script>

<template>
  <div class="opposition-mesure">
    <input
      :id="inputId"
      type="checkbox"
      :checked="refusee"
      data-testid="legal-opposition-mesure"
      @change="changer(($event.target as HTMLInputElement).checked)"
    />
    <label :for="inputId">{{ t.opposition.label }}</label>
  </div>
  <p role="status" aria-live="polite" data-testid="legal-opposition-etat">
    {{ refusee ? t.opposition.refused : t.opposition.measured }}
  </p>
</template>

<style scoped>
.opposition-mesure {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 44px;
}

.opposition-mesure input {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}
</style>
