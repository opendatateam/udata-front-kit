<template>
  <div class="fr-container fr-mt-4w">
    <h1>Les APIs FranceConnectées</h1>

    <p>Liste des APIs pouvant être requêtées via un token FranceConnect.</p>

    <div v-if="apisLoading" class="fr-mt-4w">
      <p>Chargement des APIs en cours...</p>
    </div>

    <div v-else-if="apisFranceConnectees.length === 0" class="fr-mt-4w">
      <p>Aucune API FranceConnectée trouvée.</p>
    </div>

    <ul v-else class="fr-grid-row fr-grid-row--gutters list-none">
      <li
        v-for="apiOrDataset in apisFranceConnectees"
        :key="apiOrDataset.UID_datagouv"
        class="fr-col-12 fr-py-0 fr-mt-4w fr-px-0"
      >
        <SimplifionsDataApi :api-or-dataset="apiOrDataset" />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import SimplifionsDataApi from '../components/SimplifionsDataApi.vue'
import { grist } from '../grist'
import type { ApiOrDataset } from '../model/grist'

const apisLoading = ref(true)
const apisFranceConnectees = ref<ApiOrDataset[]>([])

grist
  .getRecords('APIs_et_datasets', { API_FranceConnectee: [true] })
  .then((data) => {
    apisFranceConnectees.value = (
      data.map((record) => record.fields) as ApiOrDataset[]
    ).filter(
      (apiOrDataset) =>
        apiOrDataset.Visible_sur_simplifions && apiOrDataset.Type === 'API'
    )
    apisLoading.value = false
  })
  .catch((error) => {
    console.error('Failed to fetch APIs FranceConnectées:', error)
    apisLoading.value = false
  })
</script>

<style scoped>
.list-none {
  list-style: none;
  padding: 0;
  margin: 0;
}
</style>
