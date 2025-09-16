<template>
  <div class="reco-data-api-card fr-p-2w fr-mb-4w">
    <h4 class="fr-h4 fr-mb-2w">
      ➡️ {{ recommandation.Nom_de_la_recommandation }}
    </h4>

    <div
      v-if="
        recommandation.En_quoi_cette_solution_est_elle_utile_pour_ce_cas_d_usage
      "
      class="api-or-dataset-description fr-px-2w"
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

    <SimplifionsDataApi v-if="apiOrDataset" :api-or-dataset="apiOrDataset" />
  </div>
</template>

<script setup lang="ts">
import { fromMarkdown } from '@/utils'
import { grist } from '../grist.ts'
import type { ApiOrDataset, Recommandation } from '../model/grist'
import SimplifionsDataApi from './SimplifionsDataApi.vue'

const props = defineProps<{
  recommandation: Recommandation
}>()

const apiOrDataset = ref<ApiOrDataset | undefined>(undefined)
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
