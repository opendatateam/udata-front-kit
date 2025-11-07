<template>
  <div class="reco-data-api-card fr-p-2w fr-mb-4w">
    <div class="fr-grid-row">
      <h4 class="fr-h4 fr-mb-2w fr-col-md fr-col-12">
        ➡️ {{ recommandation.Nom_de_la_recommandation }}
      </h4>

      <div v-if="access_url">
        <a
          rel="noopener noreferrer"
          :href="access_url"
          class="fr-btn access-link"
          target="_blank"
        >
          Demande d'accès
        </a>
      </div>
    </div>

    <div
      v-if="
        recommandation.En_quoi_cette_solution_est_elle_utile_pour_ce_cas_d_usage
      "
      class="api-or-dataset-description fr-px-2w fr-mt-2w fr-mb-4w"
    >
      <!-- eslint-disable vue/no-v-html -->
      <p
        v-html="
          fromMarkdown(
            recommandation.En_quoi_cette_solution_est_elle_utile_pour_ce_cas_d_usage
          )
        "
      ></p>
      <!-- eslint-enable vue/no-v-html -->
    </div>

    <SimplifionsDataApi
      v-if="apiOrDataset"
      :api-or-dataset="apiOrDataset"
      @resource-fetched="handleResourceFetched"
      title-tag="h5"
    />
  </div>
</template>

<script setup lang="ts">
import { fromMarkdown } from '@/utils'
import type { Dataservice, DatasetV2 } from '@datagouv/components-next'
import { grist } from '../grist.ts'
import type { ApiOrDataset, Recommandation } from '../model/grist'
import SimplifionsDataApi from './SimplifionsDataApi.vue'

const props = defineProps<{
  recommandation: Recommandation
}>()

const apiOrDataset = ref<ApiOrDataset | undefined>(undefined)
const fetchedResource = ref<DatasetV2 | Dataservice | undefined>(undefined)

const access_url = computed(() => {
  // Prioritize the URL from the recommandation
  if (props.recommandation.access_link_with_fallback) {
    return props.recommandation.access_link_with_fallback
  }
  // Fall back to the authorization_request_url from the fetched dataservice
  // (authorization_request_url only exists on dataservices, not datasets)
  if (
    fetchedResource.value &&
    'authorization_request_url' in fetchedResource.value
  ) {
    return (fetchedResource.value as Dataservice).authorization_request_url
  }
  return undefined
})

const handleResourceFetched = (resource: DatasetV2 | Dataservice) => {
  fetchedResource.value = resource
}

grist
  .getRecord(
    'APIs_et_datasets',
    props.recommandation.API_ou_datasets_recommandes
  )
  .then((data) => {
    apiOrDataset.value = data.fields as ApiOrDataset
  })
</script>

<style scoped>
.reco-data-api-card {
  background-color: var(--background-alt-beige-gris-galet);
  border-radius: 4px;
}
</style>
