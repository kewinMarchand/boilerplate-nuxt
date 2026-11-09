<script setup lang="ts">
import { definePageMeta, useRuntimeConfig } from '#imports'

import { SITE } from '@/shared/config'
import { useDictionary, useLocale, useLocalizePath } from '@/shared/i18n'
import { organizationJsonLd, usePageSeo, websiteJsonLd } from '@/shared/seo'

import { usePageMeta, useSiteIdentity } from '@/modules/identity'

import { HomeView } from '@/views/home'

definePageMeta({ fullBleed: true })

const { siteUrl } = useRuntimeConfig().public
const identity = await useSiteIdentity()
const meta = await usePageMeta('home')
const t = useDictionary()
const { locale } = useLocale()
const localizePath = useLocalizePath()

usePageSeo({
  title: t.meta.home.title,
  adminTitle: () => meta.value.title,
  description: () => meta.value.description || identity.value.tagline || SITE.description,
  jsonLd: () => [
    organizationJsonLd(siteUrl, identity.value.name, identity.value.icon?.png512),
    websiteJsonLd(siteUrl, identity.value.name, localizePath('/'), locale),
  ],
})
</script>

<template>
  <HomeView
    :site-name="identity.name"
    :tagline="identity.tagline"
    :sales-enabled="identity.salesEnabled"
  />
</template>
