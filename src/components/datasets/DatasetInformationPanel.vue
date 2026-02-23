<script setup lang="ts">
import type { DatasetV2WithFullObject } from '@datagouv/components-next'
import {
  AnimatedLoader,
  DatasetEmbedSection,
  DatasetInformationSection,
  DatasetSchemaSection,
  DatasetSpatialSection,
  DatasetTemporalitySection
} from '@datagouv/components-next'
import LeafletMap from './LeafletMap.vue'

defineProps<{
  dataset: DatasetV2WithFullObject
}>()
</script>

<template>
  <div class="divide-y">
    <DatasetInformationSection :dataset="dataset" />
    <DatasetTemporalitySection :dataset="dataset" />
    <DatasetSpatialSection :dataset="dataset">
      <template #map="{ geojson }">
        <LeafletMap :geojson="geojson" width="350px" height="350px" />
      </template>
    </DatasetSpatialSection>
    <Suspense>
      <DatasetSchemaSection :dataset="dataset" />
      <template #fallback>
        <AnimatedLoader />
      </template>
    </Suspense>
    <DatasetEmbedSection :dataset="dataset" />
  </div>
</template>
