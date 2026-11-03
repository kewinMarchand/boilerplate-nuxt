<script setup lang="ts">
import { useRuntimeConfig } from '#imports'

import { matomoConfig } from '@/shared/observability'

import { LegalPageContent } from '@/modules/content'

import OppositionMesure from './OppositionMesure.vue'

const { matomoUrl, matomoSiteId } = useRuntimeConfig().public
const isAudienceMeasured = matomoConfig(matomoUrl, matomoSiteId) !== null
</script>

<template>
  <LegalPageContent slug="donnees-personnelles" fallback-title="Données personnelles" />

  <section
    v-if="isAudienceMeasured"
    aria-labelledby="mesure-audience"
    data-testid="legal-audience-measurement"
  >
    <h2 id="mesure-audience">Mesure d’audience</h2>
    <p>
      La fréquentation du site est mesurée avec Matomo, hébergé par l’éditeur, configuré sans cookie
      et sans identifiant : aucun suivi d’un site à l’autre, aucune donnée transmise à un tiers. Les
      statistiques produites sont anonymes et servent uniquement à améliorer le site. Les données
      brutes sont conservées 25 mois au plus.
    </p>
    <p>
      Vous pouvez vous opposer à cette mesure : votre choix est gardé dans ce navigateur, sans
      cookie.
    </p>
    <OppositionMesure />
  </section>
</template>
