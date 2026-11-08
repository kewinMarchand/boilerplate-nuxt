<script setup lang="ts">
import { definePageMeta, useRuntimeConfig } from '#imports'

import { SITE } from '@/shared/config'
import { organizationJsonLd, usePageSeo, websiteJsonLd } from '@/shared/seo'

import { useSiteIdentity } from '@/modules/identity'

import { HomeView } from '@/views/home'

definePageMeta({ fullBleed: true })

const { siteUrl } = useRuntimeConfig().public
const identity = await useSiteIdentity()

usePageSeo({
  title: 'Accueil',
  description: () => identity.value.tagline || SITE.description,
  jsonLd: () => [
    organizationJsonLd(siteUrl, identity.value.name),
    websiteJsonLd(siteUrl, identity.value.name),
  ],
})
</script>

<template>
  <HomeView :site-name="identity.name" :tagline="identity.tagline" />
</template>
