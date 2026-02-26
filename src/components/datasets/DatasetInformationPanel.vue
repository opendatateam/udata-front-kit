<script setup lang="ts">
import type { ExtendedDatasetV2WithFullObject } from '@/model/dataset'
import {
  AnimatedLoader,
  DatasetEmbedSection,
  DatasetInformationSection,
  DatasetSchemaSection,
  DatasetSpatialSection,
  DatasetTemporalitySection,
  ExtraAccordion
} from '@datagouv/components-next'
import { storeToRefs } from 'pinia'

import LeafletMap from './LeafletMap.vue'

import config from '@/config'
import { useUserStore } from '@/store/UserStore'

defineProps<{
  dataset: ExtendedDatasetV2WithFullObject
}>()

const userStore = useUserStore()
const { isAdmin } = storeToRefs(userStore)

const goToHarvester = (sourceId: string) => {
  const url = `${config.datagouvfr.base_url}/admin/harvesters/${sourceId}`
  window.location.href = url
}
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
    <!-- Suspense component (experimental) is required here because `DatasetSchemaSection`
        is a component with an async setup(). If Suspense is removed from vue, `DatasetSchemaSection` must be
        updated to handle its own loading state. -->
    <Suspense>
      <DatasetSchemaSection :dataset="dataset" />
      <template #fallback>
        <AnimatedLoader />
      </template>
    </Suspense>
    <DatasetEmbedSection :dataset="dataset" />
    <div>
      <ExtraAccordion
        v-if="dataset.extras && Object.keys(dataset.extras).length"
        class="pt-6"
        button-text="Voir les extras"
        title-text="Extras"
        :extra="dataset.extras"
        title-level="h3"
      />
      <ExtraAccordion
        v-if="dataset.harvest"
        button-text="Voir les extras du moissonnage"
        title-text="Moissonnage"
        :extra="dataset.harvest"
        title-level="h3"
      >
        <template #buttons>
          <DsfrButton
            v-if="isAdmin && dataset.harvest.source_id"
            secondary
            icon="fr-icon-server-line"
            size="sm"
            label="Voir la source du moissonnage"
            @click.prevent="goToHarvester(dataset.harvest.source_id)"
          />
        </template>
      </ExtraAccordion>
    </div>
  </div>
</template>
