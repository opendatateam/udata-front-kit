<script setup>
import { useRoute } from "vue-router"
import { computed, onMounted, ref, watchEffect } from "vue"

import { useOrganizationStore } from "../../store/OrganizationStore"
import { useDatasetStore } from "../../store/DatasetStore"
import Tile from "../../components/Tile.vue"

const route = useRoute()
const organizationId = route.params.oid

const orgStore = useOrganizationStore()
const datasetStore = useDatasetStore()

const org = computed(() => orgStore.get(organizationId) || {})

const currentPage = ref(1)
const pages = ref([])
const datasets = ref({})

onMounted(() => {
  orgStore.load(organizationId)
})

// we need the technical id to fetch the datasets and thus pagination
watchEffect(() => {
  if (!org.value.id) return
  datasetStore.loadDatasetsForOrg(org.value.id, currentPage.value).then(_datasets => {
      datasets.value = _datasets
      if(!pages.value.length) {
        pages.value = datasetStore.getDatasetsPaginationForOrg(org.value.id)
      }
    })
  })
</script>

<template>
  <div class="fr-container--fluid fr-mt-4w fr-mb-4w">
    <h1>{{ org.name }}</h1>
    <div>{{ org.description }}</div>

    <h2 class="fr-mt-2w">Jeux de données</h2>
    <div v-if="!datasets?.data?.length">Pas de jeu de données pour cette organisation.</div>
    <ul v-else class="fr-grid-row fr-grid-row--gutters es__tiles__list">
      <li v-for="d in datasets.data" class="fr-col-12 fr-col-lg-4">
        <Tile
          :link="`/datasets/${d.slug}`"
          :title="d.title"
          :description="d.description"
          :img="d.organization.logo"
        />
      </li>
    </ul>
  </div>
  <DsfrPagination v-if="pages.length" :current-page="currentPage - 1" :pages="pages" @update:current-page="p => currentPage = p + 1" />
</template>
