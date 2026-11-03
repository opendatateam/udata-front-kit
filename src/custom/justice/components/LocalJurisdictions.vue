<script lang="ts" setup>
import type { DatasetV2WithFullObject } from '@datagouv/components-next'
import { onMounted, ref } from 'vue'

import JurisdictionMap, {
  type JurisdictionLayer
} from '@/custom/justice/components/JurisdictionMap.vue'
import JusticeSection from '@/custom/justice/components/JusticeSection.vue'
import VizCard from '@/custom/justice/components/VizCard.vue'
import { loadJusticeDataset } from '@/custom/justice/utils/dataset'
import {
  fetchResourceGeoJson,
  type MapFeature
} from '@/custom/justice/utils/geojson'

const COURTS = [
  {
    id: 'tj',
    label: 'Tribunaux judiciaires',
    resource: 'e9fd69b3-f5d7-4c27-89bf-97989b201683'
  },
  {
    id: 'tp',
    label: 'Tribunaux de proximité',
    resource: '4314cf11-4385-45b9-95bc-962f94950525'
  },
  {
    id: 'cph',
    label: 'Conseils de prud’hommes',
    resource: 'eacc14d4-9845-41fe-9644-dedb5d171555'
  },
  {
    id: 'ca',
    label: 'Cours d’appel',
    resource: 'db341dde-27b2-4d08-af1f-f3a960fcfaa9'
  }
] as const

const layers = ref<JurisdictionLayer[]>([])
const dataset = ref<DatasetV2WithFullObject | null>(null)
const error = ref(false)
const loading = ref(true)

function asCourts(features: MapFeature[]): MapFeature[] {
  return features.map((feature, index) => ({
    type: 'Feature',
    id: String(feature.properties.code ?? index),
    properties: { nom: String(feature.properties.nom ?? '') },
    geometry: feature.geometry
  }))
}

onMounted(async () => {
  try {
    const [loadedDataset, ...collections] = await Promise.all([
      loadJusticeDataset(),
      ...COURTS.map((court) => fetchResourceGeoJson(court.resource))
    ])
    dataset.value = loadedDataset
    layers.value = COURTS.map((court, index) => ({
      id: court.id,
      label: court.label,
      features: asCourts(collections[index] ?? [])
    }))
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <JusticeSection
    title="Connaître vos juridictions locales"
    description="Chaque territoire relève d’une juridiction. Choisissez un type de tribunal pour voir son ressort, puis survolez une zone pour lire son nom."
    loading-label="Préparation de la carte…"
    error-label="La carte n’a pas pu être chargée."
    :loading="loading"
    :error="error"
    :dataset="dataset"
  >
    <VizCard
      source-id="sources-juridictions"
      source="Le contour est le ressort de la juridiction, le territoire sur lequel elle est compétente. Le survol assombrit la zone et affiche son nom."
    >
      <JurisdictionMap :layers="layers" />
    </VizCard>
  </JusticeSection>
</template>
