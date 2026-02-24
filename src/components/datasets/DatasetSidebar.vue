<script setup lang="ts">
import OrganizationLogo from '@/components/OrganizationLogo.vue'
import ContactPoints from '@/components/datasets/ContactPoints.vue'
import config from '@/config'
import type { TypedHarvest } from '@/model/dataset'
import { formatDate } from '@/utils'
import { useDatasetsConf } from '@/utils/config'
import { useBadges, useLicense } from '@/utils/dataset'
import type { DatasetMetrics, DatasetV2 } from '@datagouv/components-next'
import {
  AppLink,
  DatasetQuality,
  LabelTag,
  OrganizationNameWithCertificate,
  StatBox,
  useMetrics
} from '@datagouv/components-next'
import { ref, toRef, watchEffect } from 'vue'

const props = defineProps({
  dataset: {
    type: Object as PropType<DatasetV2>,
    required: true
  }
})

const datasetsConf = useDatasetsConf()

const harvest = computed(() => props.dataset.harvest as TypedHarvest)
const datasetRef = toRef(props.dataset)
const license = useLicense(datasetRef)
const badges = useBadges(datasetRef)

const { getDatasetMetrics } = useMetrics()
const datasetMetrics = ref<DatasetMetrics | null>(null)

watchEffect(async () => {
  if (!props.dataset?.id) return
  try {
    datasetMetrics.value = await getDatasetMetrics(props.dataset.id)
  } catch (error) {
    console.error('Failed to fetch dataset metrics', error)
    datasetMetrics.value = null
  }
})

const datasetVisits = computed(() => datasetMetrics.value?.visits ?? {})
const datasetVisitsTotal = computed(
  () => datasetMetrics.value?.visitsTotal ?? 0
)
const datasetDownloadsResources = computed(
  () => datasetMetrics.value?.downloads ?? {}
)
const datasetDownloadsResourcesTotal = computed(
  () => datasetMetrics.value?.downloadsTotal ?? 0
)

const showHarvestQualityWarning = computed(() => {
  const backend = harvest.value?.backend
  const warningBackends = datasetsConf.harvest_backends_quality_warning || []
  return backend && warningBackends.includes(backend)
})
</script>

<template>
  <div class="dataset-sidebar fr-col-12 fr-col-md-4">
    <h2 id="producer" class="subtitle fr-mb-1v">
      <span v-if="dataset.contact_points.length">Éditeur</span>
      <span v-else>Producteur</span>
    </h2>
    <div v-if="dataset.organization" class="fr-grid-row fr-grid-row--middle">
      <OrganizationLogo :object="dataset" :size="32" class="fr-mr-1-5v" />
      <p class="fr-col fr-m-0 min-width-0">
        <a class="fr-link" :href="dataset.organization.page">
          <OrganizationNameWithCertificate
            :organization="dataset.organization"
          />
        </a>
      </p>
    </div>
    <template v-if="dataset.contact_points.length">
      <h2 id="attributions" class="subtitle fr-mb-1v fr-mt-3v">Attributions</h2>
      <ContactPoints :contact-points="dataset.contact_points" />
    </template>
    <div v-if="harvest?.remote_url" class="fr-my-3v fr-text--sm">
      <div class="bg-alt-blue fr-p-3v fr-mb-1w">
        <p class="fr-grid-row fr-grid-row--middle fr-my-0">
          Ce jeu de données provient d'un portail externe.
          <AppLink
            :to="harvest.remote_url"
            target="_blank"
            rel="noopener nofollow"
            >Voir la source originale.</AppLink
          >
        </p>
      </div>
    </div>
    <template v-if="harvest">
      <template v-if="harvest.modified_at">
        <h2 class="subtitle fr-mt-3v fr-mb-1v">Dernière révision</h2>
        <p>
          {{ formatDate(harvest.modified_at) }}
        </p>
      </template>
    </template>
    <template v-else>
      <h2 class="subtitle fr-mt-3v fr-mb-1v">Dernière mise à jour</h2>
      <p>{{ formatDate(dataset.last_update) }}</p>
    </template>
    <template v-if="license">
      <h2 class="subtitle fr-mt-3v fr-mb-1v">Licence</h2>
      <p class="fr-text--sm fr-mt-0 fr-mb-3v">
        <code class="license-code fr-px-1v text-grey-425">
          <a :href="license.url">
            {{ license.title }}
          </a>
        </code>
      </p>
    </template>
    <div class="fr-grid-row fr-grid-row--gutters fr-my-3v">
      <div class="fr-col-6">
        <StatBox
          title="Vues"
          :data="datasetVisits"
          size="sm"
          type="line"
          :summary="datasetVisitsTotal"
        />
      </div>
      <div class="fr-col-6">
        <StatBox
          title="Téléchargements"
          :data="datasetDownloadsResources"
          size="sm"
          type="line"
          :summary="datasetDownloadsResourcesTotal"
        />
      </div>
    </div>
    <DatasetQuality
      v-if="config.website.show_quality_component"
      :quality="dataset.quality"
    />
    <div
      v-if="showHarvestQualityWarning"
      class="text-mention-grey fr-text--sm fr-my-1v"
    >
      <VIconCustom name="warning-line" class="fr-icon--sm" />
      La qualité des métadonnées peut être trompeuse car les métadonnées de la
      source originale peuvent avoir été perdues lors de leur récupération. Nous
      travaillons actuellement à améliorer la situation.
    </div>
    <template v-if="badges.length > 0">
      <h2 id="labels" class="subtitle fr-mb-1v fr-mt-3v">Label</h2>
      <LabelTag
        v-for="badge in badges"
        :key="badge.kind"
        :badge
        class="fr-mr-1v"
      />
    </template>
    <slot name="bottom" />
  </div>
</template>

<style scoped>
.license-code {
  background-color: var(--background-alt-grey);
}
</style>
