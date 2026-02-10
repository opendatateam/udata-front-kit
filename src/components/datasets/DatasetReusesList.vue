<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import { Pagination, ReuseCard, type Reuse } from '@datagouv/components-next'

import BlankState from '@/components/BlankState.vue'
import { useCurrentPageConf } from '@/router/utils'
import ReusesAPI from '@/services/api/resources/ReusesAPI'

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
const reusesAPI = new ReusesAPI()

const reuses = ref<Reuse[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = 6

const emptyMessage = computed(() => {
  if (props.emptyMessage) {
    return props.emptyMessage
  } else {
    return `Il n'y a pas encore de réutilisation pour ce ${pageConf.labels.singular}.`
  }
})

async function fetchReuses() {
  const response = await reusesAPI.getReusesForDataset(
    props.datasetId,
    page.value,
    pageSize
  )
  reuses.value = response.data
  total.value = response.total
}

watch(page, fetchReuses)

onMounted(fetchReuses)
</script>

<template>
  <div v-if="total > 0">
    <h2 class="fr-mt-4w subtitle subtitle--uppercase">
      {{ total }} {{ total > 1 ? 'réutilisations' : 'réutilisation' }}
    </h2>
    <ul class="fr-grid-row fr-grid-row--gutters fr-pl-0" role="list">
      <li
        v-for="reuse in reuses"
        :key="reuse.id"
        class="fr-col-12 fr-col-md-6 fr-col-lg-4"
      >
        <ReuseCard :reuse="reuse" :reuse-url="reuse.page" />
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
    image="/static/blank_state/reuse.svg"
    :message="emptyMessage"
  >
    <p>
      <a
        class="fr-btn fr-btn--sm fr-btn--secondary fr-ml-1w"
        href="https://guides.data.gouv.fr/publier-des-donnees/guide-data.gouv.fr/reutilisations"
      >
        Qu'est-ce qu'une réutilisation ?
      </a>
    </p>
  </BlankState>
</template>
