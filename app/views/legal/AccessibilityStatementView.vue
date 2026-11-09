<script setup lang="ts">
import { useDictionary } from '@/shared/i18n'

import { LegalPageContent } from '@/modules/content'

const t = useDictionary()
</script>

<template>
  <LegalPageContent slug="accessibilite" :fallback-title="t.legal.accessibilityTitle" />
</template>
