<script setup lang="ts">
// TODO: search should be done here, based on dynamic props

import type { DatasetV2 } from '@datagouv/components'
import { DatasetCard } from '@datagouv/components'
import { useRouter } from 'vue-router'

const props = defineProps({
  datasets: {
    type: Array as () => DatasetV2[],
    required: true
  }
})

const router = useRouter()

const zIndex = (key: number) => {
  return { zIndex: props.datasets.length - key }
}

const getDatasetPage = (id: string) => {
  return { name: 'dataset_detail', params: { did: id } }
}

const getOrganizationPage = (id: string | undefined) => {
  if (router.hasRoute('organization_detail')) {
    return { name: 'organization_detail', params: { oid: id } }
  }
  return ''
}
</script>

<template>
  <div v-if="datasets?.length === 0" class="fr-mb-4w">
    Aucun résultat pour cette recherche.
  </div>
  <div class="fr-col-md-12">
    <DatasetCard
      v-for="(d, index) in datasets"
      :key="d.id"
      :style="zIndex(index)"
      :dataset="d"
      :dataset-url="getDatasetPage(d.id)"
      :organization-url="getOrganizationPage(d.organization?.id)"
    />
  </div>
</template>
