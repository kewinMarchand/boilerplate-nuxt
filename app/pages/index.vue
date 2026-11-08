<script setup lang="ts">
import { definePageMeta, useRuntimeConfig } from '#imports'

import { SITE } from '@/shared/config'
import { organizationJsonLd, usePageSeo, websiteJsonLd } from '@/shared/seo'

import { usePageMeta, useSiteIdentity } from '@/modules/identity'

import { HomeView } from '@/views/home'

definePageMeta({ fullBleed: true })

const { siteUrl } = useRuntimeConfig().public
const identity = await useSiteIdentity()
const meta = await usePageMeta('home')

usePageSeo({
  title: 'Accueil',
  adminTitle: () => meta.value.title,
  description: () => meta.value.description || identity.value.tagline || SITE.description,
  jsonLd: () => [
    organizationJsonLd(siteUrl, identity.value.name, identity.value.icon?.png512),
    websiteJsonLd(siteUrl, identity.value.name),
  ],
})
</script>

<template>
  <HomeView :site-name="identity.name" :tagline="identity.tagline" />
</template>
