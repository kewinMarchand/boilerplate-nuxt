<script setup lang="ts">
import { useLocalizePath } from '@/shared/i18n'

import type { NavigationItem } from '@/shared/config'

const { href, label } = defineProps<NavigationItem>()
const localizePath = useLocalizePath()
</script>

<template>
  <NuxtLink :to="localizePath(href)" class="header-link" data-testid="layout-nav-link">{{
    label
  }}</NuxtLink>
</template>
