<template>
  <div class="test_api-or-dataset-card">
    <div
      v-if="resourceNotFound || !datagouvResource"
      class="disabled-card fr-p-2w"
    >
      <h4 class="fr-col-12">
        {{ apiOrData.Nom_donnees_ou_API }}
      </h4>
      <p class="fr-col-12 fr-grid-row justify-between">
        <span class="fr-text--sm fr-mb-0"
          >ID: {{ apiOrData.UID_data_gouv }}</span
        >

        <span v-if="resourceNotFound">
          ⚠️ {{ apiOrData.Type }} non trouvé{{
            apiOrData.Type == 'API' ? 'e' : ''
          }}
        </span>
        <span v-else> Chargement du lien en cours... </span>
      </p>
    </div>

    <DatasetCard
      v-else-if="entityName == 'datasets'"
      class="no-margins"
      :dataset="datagouvResource as DatasetV2"
      :dataset-url="datagouvLink"
    />
    <DataserviceCard
      v-else-if="entityName == 'dataservices'"
      class="no-margins"
      :dataservice="datagouvResource as DataserviceV2"
      :dataservice-url="datagouvLink"
    />
    <div v-else>{{ entityName }} | {{ datagouvResource.title }}</div>
  </div>
</template>

<script setup lang="ts">
import DataserviceCard from '@/components/DataserviceCard.vue'
import type { DataserviceV2 } from '@/model/dataservice'
import DatagouvfrAPI from '@/services/api/DatagouvfrAPI'
import type { DatasetV2 } from '@datagouv/components'
import { DatasetCard } from '@datagouv/components'
import type { SimplifionsDataOrApi } from '../model/cas_usage'

const props = defineProps<{
  apiOrData: SimplifionsDataOrApi
}>()

const entityName = props.apiOrData.Type == 'API' ? 'dataservices' : 'datasets'
const datagouvLink = ref(
  `https://www.data.gouv.fr/fr/${entityName}/${props.apiOrData.UID_data_gouv}`
)
const resourceNotFound = ref(false)
const datagouvResource = ref<DatasetV2 | DataserviceV2 | null>(null)

// Get the actual data from datagouv, and replace reactive properties with it if it's found
// If not found, disable the card
onMounted(async () => {
  try {
    const api = new DatagouvfrAPI({ endpoint: entityName })
    datagouvResource.value = await api.request({
      url: `${api.url()}/${props.apiOrData.UID_data_gouv}`,
      method: 'get',
      params: {
        fields:
          'title,description,organization,resources,tags,created_at,updated_at'
      }
    })
  } catch (error) {
    resourceNotFound.value = true
    console.error('Failed to fetch datagouv resource:', error)
  }
})
</script>

<style scoped>
.no-margins {
  margin: 0 !important;
}

.disabled-card {
  background-color: #f0f0f0;
  opacity: 0.5;
}
</style>
