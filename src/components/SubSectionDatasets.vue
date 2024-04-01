<script setup>
import { DatasetCard } from '@etalab/data.gouv.fr-components'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { useDatasetStore } from '@/store/DatasetStore'

const router = useRouter()
const datasetStore = useDatasetStore()

const props = defineProps({
  subsection: {
    type: Object,
    required: true
  }
})

const fetchedDatasets = ref([])
const loadDatasets = async () => {
  fetchedDatasets.value = await datasetStore.loadDatasetsByIds(
    props.subsection.datasets
  )
}

const zIndex = (key) => {
  return { zIndex: fetchedDatasets.value.length - key }
}

const getDatasetPage = (id) => {
  return { name: 'dataset_detail', params: { did: id } }
}

const getOrganizationPage = (id) => {
  if (router.hasRoute('organization_detail')) {
    return { name: 'organization_detail', params: { oid: id } }
  }
  return ''
}

onMounted(() => {
  loadDatasets()
})
</script>

<template>
  <div class="datagouv-components fr-col-md-12">
    <h3 v-if="subsection.title">{{ subsection.title }}</h3>
    <DatasetCard
      v-for="(d, index) in fetchedDatasets"
      :key="d.id"
      :style="zIndex(index)"
      :dataset="d"
      :dataset-url="getDatasetPage(d.id)"
      :organization-url="getOrganizationPage(d.organization.id)"
    />
  </div>
</template>
