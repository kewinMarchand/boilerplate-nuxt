<script setup lang="ts">
import { useRuntimeConfig } from '#imports'

import { useDictionary, useLocalizePath } from '@/shared/i18n'
import { usePageDictionary } from '@/shared/i18n/route'
import { usePageSeo } from '@/shared/seo'

import { BlogView } from '@/modules/blog'
import { usePageMeta } from '@/modules/identity'

await usePageDictionary(['blog', 'meta.blog'])
const { siteUrl } = useRuntimeConfig().public
const meta = await usePageMeta('blog')
const t = useDictionary()
const localizePath = useLocalizePath()
const description = () => meta.value.description || t.meta.blog.description

usePageSeo({
  title: t.meta.blog.title,
  adminTitle: () => meta.value.title,
  description,
  jsonLd: () => [
    {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: t.blog.title,
      description: description(),
      url: new URL(localizePath('/blog'), siteUrl).href,
      inLanguage: t.language.tag,
    },
  ],
})
</script>

<template>
  <BlogView />
</template>
