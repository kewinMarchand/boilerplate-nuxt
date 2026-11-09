<script setup lang="ts">
import { useRuntimeConfig } from '#imports'

import { useDictionary } from '@/shared/i18n'
import { matomoConfig } from '@/shared/observability'

import { LegalPageContent } from '@/modules/content'

import OppositionMesure from './OppositionMesure.vue'

const t = useDictionary()
const { matomoUrl, matomoSiteId } = useRuntimeConfig().public
const isAudienceMeasured = matomoConfig(matomoUrl, matomoSiteId) !== null
</script>

<template>
  <LegalPageContent slug="donnees-personnelles" :fallback-title="t.legal.privacyTitle" />

  <section
    v-if="isAudienceMeasured"
    aria-labelledby="mesure-audience"
    data-testid="legal-audience-measurement"
  >
    <h2 id="mesure-audience">{{ t.legal.audienceTitle }}</h2>
    <p>{{ t.legal.audienceText }}</p>
    <p>{{ t.legal.oppositionText }}</p>
    <OppositionMesure />
  </section>
</template>
