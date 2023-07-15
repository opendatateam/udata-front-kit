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
const selectedSort = ref("-created")

onMounted(() => {
  orgStore.load(organizationId)
})

const sorts = [
  { value: "-created", text: "Les plus récemment créés" },
  { value: "title", text: "Titre" },
]

function doSort (sort) {
  currentPage.value = 1
  selectedSort.value = sort
}

// we need the technical id to fetch the datasets and thus pagination
watchEffect(() => {
  if (!org.value.id) return
  datasetStore.loadDatasetsForOrg(org.value.id, currentPage.value, selectedSort.value).then(_datasets => {
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

  <div class="w-100 fr-grid-row fr-grid-row--middle fr-mt-5v justify-end">
    <div class="fr-col-auto fr-grid-row fr-grid-row--middle">
      <label for="sort-search" class="fr-col-auto fr-text--sm fr-m-0 fr-mr-1w">
        Trier par :
      </label>
      <div class="fr-col">
        <DsfrSelect :model-value="selectedSort" @update:modelValue="doSort" :options="sorts" label=""></DsfrSelect>
      </div>
    </div>
  </div>

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
