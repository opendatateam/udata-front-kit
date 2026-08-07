<template>
  <div v-if="isDisabled" :class="`api-or-dataset-card ${datagouvType}-card`">
    <div class="api-or-dataset-header">
      <div class="disabled-card fr-p-2w">
        <h3 class="fr-text--md fr-col-12">
          {{ props.apiOrDataset.Nom }}
        </h3>
        <p class="fr-col-12 fr-grid-row justify-between">
          <span class="fr-text--sm fr-mb-0"
            >ID: {{ props.apiOrDataset.UID_datagouv }}</span
          >

          <span v-if="hasEmptyUid"> ⚠️ Datagouv UID missing </span>
          <span v-else-if="resourceNotFound">
            ⚠️ {{ props.apiOrDataset.Type }} introuvable sur data.gouv.fr
          </span>
          <span v-else> Chargement du lien en cours... </span>
        </p>
      </div>
    </div>
  </div>

  <a
    v-else
    :href="datagouvLink"
    target="_blank"
    rel="noopener noreferrer"
    :title="`${props.apiOrDataset.Nom} - ouvre une nouvelle fenêtre`"
    :class="`api-or-dataset-card ${datagouvType}-card`"
  >
    <div class="api-or-dataset-header">
      <SimplifionsDatasetDataserviceCard
        v-if="datagouvLink"
        :class="`no-margins ${cardClass}`"
        :title="datagouvResource!.title"
        :organization="datagouvResource!.organization"
        :owner="datagouvResource!.owner"
        :access-type="datagouvResource!.access_type"
        :access-audiences="datagouvResource!.access_audiences"
        :resource-label="cardResourceLabel"
        :link-label="cardLinkLabel"
        :title-tag="props.titleTag"
      />
    </div>
  </a>
</template>

<script setup lang="ts">
import SimplifionsDatasetDataserviceCard from '@/custom/simplifions/components/SimplifionsDatasetDataserviceCard.vue'
import DatagouvfrAPI from '@/services/api/DatagouvfrAPI'
import type { Dataservice, DatasetV2 } from '@datagouv/components-next'
import * as Sentry from '@sentry/vue'
import type { ApiOrDatasetCardData } from '../model/grist'

const props = withDefaults(
  defineProps<{
    apiOrDataset: ApiOrDatasetCardData
    titleTag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  }>(),
  {
    titleTag: 'h3'
  }
)

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

const isDisabled = computed(
  () => hasEmptyUid.value || resourceNotFound.value || !datagouvResource.value
)

const datagouvType = computed(() => {
  switch (props.apiOrDataset.Type) {
    case 'API':
      return 'dataservices'
    case 'Jeu de données':
    case 'Base de données':
      return 'datasets'
    default:
      throw new Error(`Unknown api or dataset type: ${props.apiOrDataset.Type}`)
  }
})

const cardClass = computed(() =>
  datagouvType.value == 'datasets' ? 'dataset-card' : 'dataservice-card'
)

const cardResourceLabel = computed(() =>
  datagouvType.value == 'datasets' ? 'Base de données' : 'API'
)

const cardLinkLabel = computed(() =>
  datagouvType.value == 'datasets'
    ? 'Voir le jeu de données sur Data.gouv.fr'
    : "Voir l'API sur Data.gouv.fr"
)

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
        fields: 'title,organization,owner,access_type,access_audiences'
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

a.api-or-dataset-card[target='_blank']::after {
  content: none;
}

a.api-or-dataset-card:hover .api-or-dataset-description,
a.api-or-dataset-card:hover .api-or-dataset-header {
  background-color: var(--hover);
}

.api-or-dataset-header {
  background-color: white;
}
</style>
