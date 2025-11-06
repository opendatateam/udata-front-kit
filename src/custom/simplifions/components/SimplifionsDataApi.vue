<template>
  <a :href="datagouvLink" :class="`api-or-dataset-card ${datagouvType}-card`">
    <div class="api-or-dataset-header">
      <div
        v-if="hasEmptyUid || resourceNotFound || !datagouvResource"
        class="disabled-card fr-p-2w"
      >
        <h4 class="fr-col-12">
          {{ props.apiOrDataset.Nom }}
        </h4>
        <p class="fr-col-12 fr-grid-row justify-between">
          <span class="fr-text--sm fr-mb-0"
            >ID: {{ props.apiOrDataset.UID_datagouv }}</span
          >

          <span v-if="hasEmptyUid"> ⚠️ Datagouv UID missing </span>
          <span v-else-if="resourceNotFound">
            ⚠️ {{ props.apiOrDataset.Type }} non trouvé{{
              props.apiOrDataset.Type == 'API' ? 'e' : ''
            }}
          </span>
          <span v-else> Chargement du lien en cours... </span>
        </p>
      </div>

      <DatasetCard
        v-else-if="datagouvType == 'datasets' && datagouvLink"
        class="no-margins dataset-card"
        :dataset="datagouvResource as DatasetV2"
        :dataset-url="datagouvLink"
        dataset-url-in-new-tab
      />
      <DataserviceCard
        v-else-if="datagouvType == 'dataservices' && datagouvLink"
        class="no-margins dataservice-card"
        :dataservice="datagouvResource as Dataservice"
        :dataservice-url="datagouvLink"
      />
      <div v-else>{{ datagouvType }} | {{ datagouvResource.title }}</div>
    </div>
  </a>
</template>

<script setup lang="ts">
import DataserviceCard from '@/custom/simplifions/components/SimplifionsDataserviceCard.vue'
import DatagouvfrAPI from '@/services/api/DatagouvfrAPI'
import type { Dataservice, DatasetV2 } from '@datagouv/components-next'
import { DatasetCard } from '@datagouv/components-next'
import * as Sentry from '@sentry/vue'
import type { ApiOrDataset } from '../model/grist'

const props = defineProps<{
  apiOrDataset: ApiOrDataset
}>()

const emit = defineEmits<{
  resourceFetched: [resource: DatasetV2 | Dataservice]
}>()

const resourceNotFound = ref(false)
const datagouvResource = ref<DatasetV2 | Dataservice | null>(null)

const hasEmptyUid = computed(() => {
  return (
    !props.apiOrDataset.UID_datagouv ||
    props.apiOrDataset.UID_datagouv.trim() === ''
  )
})

const datagouvType = computed(() => {
  switch (props.apiOrDataset.Type) {
    case 'API':
      return 'dataservices'
    case 'Jeu de données':
      return 'datasets'
    default:
      throw new Error(`Unknown api or dataset type: ${props.apiOrDataset.Type}`)
  }
})

const datagouvApiVersion = computed(() => {
  if (datagouvType.value == 'dataservices') {
    return 1
  } else {
    return 2
  }
})

const datagouvLink = computed(() => {
  return `https://www.data.gouv.fr/fr/${datagouvType.value}/${props.apiOrDataset.UID_datagouv}`
})

// Fetch the resource data when the component mounts
// Only fetch if UID is not empty
if (!hasEmptyUid.value) {
  const api = new DatagouvfrAPI({
    endpoint: datagouvType.value,
    version: datagouvApiVersion.value
  })
  api
    .request({
      url: `${api.url()}/${props.apiOrDataset.UID_datagouv}`,
      method: 'get',
      params: {
        fields:
          'title,description,organization,resources,tags,created_at,updated_at'
      }
    })
    .then((data) => {
      datagouvResource.value = data
      // Emit the fetched resource to the parent component
      emit('resourceFetched', data)
    })
    .catch((error) => {
      resourceNotFound.value = true
      console.error('Failed to fetch datagouv resource:', error)
      Sentry.captureException(error, {
        tags: {
          component: 'SimplifionsDataApi',
          resourceType: datagouvType.value,
          uid: props.apiOrDataset.UID_datagouv
        },
        extra: {
          apiOrDatasetName: props.apiOrDataset.Nom,
          apiOrDatasetType: props.apiOrDataset.Type
        }
      })
    })
}
</script>

<style scoped>
.no-margins {
  margin: 0 !important;
}

.disabled-card {
  background-color: #f0f0f0;
  opacity: 0.5;
}

a.api-or-dataset-card {
  color: inherit;
}

a.api-or-dataset-card:hover .api-or-dataset-description,
a.api-or-dataset-card:hover .api-or-dataset-header {
  background-color: var(--hover);
}

.api-or-dataset-header {
  background-color: white;
}
</style>
