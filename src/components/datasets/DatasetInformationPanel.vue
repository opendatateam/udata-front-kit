<script setup lang="ts">
import type { ExtendedDatasetV2WithFullObject } from '@/model/dataset'
import {
  AnimatedLoader,
  CopyButton,
  DatasetEmbedSection,
  DatasetInformationSection,
  DatasetSchemaSection,
  DatasetSpatialSection,
  DescriptionListDetails,
  DescriptionListTerm,
  ExtraAccordion
} from '@datagouv/components-next'

import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import DatasetTemporalitySection from './DatasetTemporalitySection.vue'

import LeafletMap from './LeafletMap.vue'

import config from '@/config'
import { useCurrentPageConf } from '@/router/utils'
import { useUserStore } from '@/store/UserStore'
import { canRequestDoi, getDatasetDoi } from '@/utils/dataset'

const props = defineProps<{
  dataset: ExtendedDatasetV2WithFullObject
}>()

const doi = computed(() => getDatasetDoi(props.dataset))

// The request form lives on data.gouv.fr
const doiRequestUrl = computed(() => `${props.dataset.page}/informations`)

const userStore = useUserStore()
const { isAdmin } = storeToRefs(userStore)

const router = useRouter()
const { pageKey, pageConf } = useCurrentPageConf()

// Link tags to the local list page when it supports tag filtering, else keep the data.gouv.fr default
const hasLocalTagSearch =
  pageConf.list_all &&
  pageConf.filters.some((f) => f.type === 'tag') &&
  router.hasRoute(pageKey)

const tagUrl = hasLocalTagSearch
  ? (tag: string) => ({ name: pageKey, query: { tag } })
  : undefined

const goToHarvester = (sourceId: string) => {
  const url = `${config.datagouvfr.base_url}/admin/harvesters/${sourceId}`
  window.location.href = url
}
</script>

<template>
  <div class="divide-y">
    <!-- @vue-expect-error tagUrl accepts route locations at runtime, typed upstream in datagouv/cdata#1341 -->
    <DatasetInformationSection :dataset="dataset" :tag-url="tagUrl">
      <div v-if="doi || canRequestDoi(dataset)">
        <DescriptionListTerm>DOI</DescriptionListTerm>
        <DescriptionListDetails v-if="doi" class="flex items-center gap-2">
          <a
            :href="`https://doi.org/${doi}`"
            class="fr-text--sm fr-link"
            target="_blank"
            rel="noopener noreferrer"
            :title="`${doi} - nouvelle fenêtre`"
            >{{ doi }}</a
          >
          <CopyButton
            class="!-mt-0.5"
            label="Copier le DOI"
            copied-label="DOI copié !"
            :text="doi"
            :hide-label="true"
          />
        </DescriptionListDetails>
        <DescriptionListDetails
          v-else
          class="flex flex-wrap items-center gap-x-3 gap-y-1"
        >
          <span>Ce jeu de données n'a pas de DOI.</span>
          <a
            :href="doiRequestUrl"
            class="fr-text--sm fr-link"
            target="_blank"
            rel="noopener"
            title="Demander un DOI sur data.gouv.fr - nouvelle fenêtre"
            >Demander un DOI sur data.gouv.fr</a
          >
        </DescriptionListDetails>
      </div>
    </DatasetInformationSection>
    <DatasetTemporalitySection :dataset="dataset" />
    <DatasetSpatialSection :dataset="dataset">
      <template #map="{ geojson }">
        <LeafletMap :geojson="geojson" width="350px" height="350px" />
      </template>
      <div v-if="dataset.extras?.dcat?.spatial_resolution">
        <DescriptionListTerm
          >Résolution ou échelle équivalente</DescriptionListTerm
        >
        <DescriptionListDetails>{{
          dataset.extras.dcat.spatial_resolution
        }}</DescriptionListDetails>
      </div>
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
