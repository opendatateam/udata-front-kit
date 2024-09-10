<script setup lang="ts">
import { DatasetCard } from '@datagouv/components'
import type { Dataset, DatasetV2 } from '@datagouv/components'
import { ref, watch, toRef, type Ref } from 'vue'

import { type DatasetProperties } from '@/model/topic'
import { useDatasetStore } from '@/store/DatasetStore'
import { toastHttpError } from '@/utils/error'
import { isNotFoundError } from '@/utils/http'

const props = defineProps({
  datasetProperties: {
    type: Object as () => DatasetProperties,
    required: true
  },
  datasetContent: {
    type: Object as () => Dataset | DatasetV2 | undefined,
    required: true
  }
})

const datasetPropertiesRef = toRef(props, 'datasetProperties')
const dataset: Ref<DatasetV2 | undefined> = ref()

// watch(
//   datasetPropertiesRef,
//   () => {
//     if (
//       datasetPropertiesRef.value.id &&
//       !datasetPropertiesRef.value.remoteDeleted
//     ) {
//       useDatasetStore()
//         .load(datasetPropertiesRef.value.id, { toasted: false })
//         .then((d) => {
//           dataset.value = d
//         })
//         .catch((err) => {
//           if (isNotFoundError(err)) {
//             datasetPropertiesRef.value.remoteDeleted = true
//           } else {
//             toastHttpError(err)
//           }
//         })
//     }
//   },
//   { immediate: true }
// )
</script>

<template>
  <!-- Using :key ensures that the component is recreated when dataset changes
       otherwise, we have a persistence on the thumbnail -->
  <DatasetCard
    v-if="datasetContent"
    :key="datasetContent.id"
    :dataset="datasetContent"
    :dataset-url="{
      name: 'dataset_detail',
      params: { did: datasetContent.id }
    }"
    :show-metrics="false"
  />
  <DsfrAlert
    v-if="datasetProperties.remoteDeleted"
    class="fr-mb-4w"
    type="warning"
    title="Jeu de données supprimé"
  >
    <div>Ce jeu de données a été détecté comme supprimé sur data.gouv.fr.</div>
    <div>
      Son identifiant est <code>{{ datasetPropertiesRef.id }}</code
      >.
    </div>
  </DsfrAlert>
</template>
