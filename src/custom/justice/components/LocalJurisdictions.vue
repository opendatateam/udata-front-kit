<script lang="ts" setup>
import type { DatasetV2 } from '@datagouv/components-next'
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
    resource: 'cfc80063-b967-40a0-ac79-919a7a88b63b'
  },
  {
    id: 'tp',
    label: 'Tribunaux de proximité',
    resource: 'd3091d74-3959-4a19-9a36-5954ee51d227'
  },
  {
    id: 'cph',
    label: 'Conseils de prud’hommes',
    resource: '4b3eb8d5-b55a-465c-a99c-0ee20d98279a'
  },
  {
    id: 'ca',
    label: 'Cours d’appel',
    resource: 'c1e45b14-a15e-453a-8d16-582df58d77b5'
  }
] as const

const layers = ref<JurisdictionLayer[]>([])
const dataset = ref<DatasetV2 | null>(null)
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
