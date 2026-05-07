<script setup lang="ts">
import type { DatasetV2 } from '@datagouv/components-next'
import { DatasetCard } from '@datagouv/components-next'
import { toRef } from 'vue'

import { ResolvedFactor } from '@/model/topic'
import { useRouteMeta } from '@/router/utils'
import { useAsyncComponent } from '@/utils/component'

const props = defineProps({
  factor: {
    type: Object as () => ResolvedFactor,
    required: true
  },
  datasetContent: {
    type: Object as () => DatasetV2,
    required: true
  }
})

const meta = useRouteMeta()
const DatasetCardComponent = useAsyncComponent(
  () => meta?.datasetCardComponent,
  {
    fallback: DatasetCard
  }
)

const factorRef = toRef(props, 'factor')
</script>

<template>
  <!-- Using :key ensures that the component is recreated when dataset changes otherwise, we have a persistence on the thumbnail -->
  <DatasetCardComponent
    v-if="datasetContent"
    :key="datasetContent.id"
    :dataset="datasetContent"
    :dataset-url="{
      name: 'datasets_detail',
      params: { item_id: datasetContent.id }
    }"
    :show-description="false"
    class="dataset-card fr-my-2w fr-mx-0"
  />
  <DsfrAlert
    v-if="factor.remoteDeleted"
    class="fr-mb-4w"
    type="warning"
    title="Jeu de données supprimé"
  >
    <div>Ce jeu de données a été détecté comme supprimé sur data.gouv.fr.</div>
    <div>
      Son identifiant est <code>{{ factorRef.element?.id }}</code
      >.
    </div>
  </DsfrAlert>
</template>

<style scoped>
/* fix overflow from "mis à jour" text in DatasetCard */
:deep(h4 + div) {
  flex-wrap: wrap;
}
.dataset-card {
  background-color: var(--background-default-grey, #fff);
}
</style>
