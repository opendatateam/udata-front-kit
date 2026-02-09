<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import {
  DataserviceCard,
  Pagination,
  type Dataservice
} from '@datagouv/components-next'

import BlankState from '@/components/BlankState.vue'
import { useCurrentPageConf } from '@/router/utils'
import DataservicesAPI from '@/services/api/resources/DataservicesAPI'

const props = defineProps({
  datasetId: {
    type: String,
    required: true
  },
  emptyMessage: {
    type: String,
    default: null
  }
})

const { pageConf } = useCurrentPageConf()
const dataservicesAPI = new DataservicesAPI()

const dataservices = ref<Dataservice[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = 5

const getDataservicePage = (id: string) => {
  return { name: 'dataservices_detail', params: { item_id: id } }
}

const emptyMessage = computed(() => {
  if (props.emptyMessage) {
    return props.emptyMessage
  } else {
    return `Il n'y a pas encore d'API pour ce ${pageConf.labels.singular}.`
  }
})

async function fetchDataservices() {
  const response = await dataservicesAPI.getDataservicesForDataset(
    props.datasetId,
    page.value,
    pageSize
  )
  dataservices.value = response.data
  total.value = response.total
}

watch(page, fetchDataservices)

onMounted(fetchDataservices)
</script>

<template>
  <div v-if="total > 0">
    <h2 class="fr-mt-4w subtitle subtitle--uppercase">{{ total }} API</h2>
    <ul class="fr-grid-row fr-grid-row--gutters fr-pl-0" role="list">
      <li
        v-for="dataservice in dataservices"
        :key="dataservice.id"
        class="fr-col-12 dataservice-card-container"
      >
        <DataserviceCard
          :dataservice="dataservice"
          :dataservice-url="getDataservicePage(dataservice.id)"
        />
      </li>
    </ul>
    <Pagination
      v-if="total > pageSize"
      class="fr-mt-3w"
      :page="page"
      :page-size="pageSize"
      :total-results="total"
      @change="(p: number) => (page = p)"
    />
  </div>
  <BlankState
    v-else
    image="/static/blank_state/dataservice.svg"
    :message="emptyMessage"
  />
</template>

<style scoped>
.dataservice-card-container {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}
</style>
