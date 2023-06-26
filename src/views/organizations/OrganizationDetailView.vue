<script setup>
import { useRoute } from "vue-router"
import { computed, ref } from "vue"

import { useOrganizationStore, useDatasetStore } from "../../store"

const route = useRoute()
const organizationId = route.params.oid

const orgStore = useOrganizationStore()
const datasetStore = useDatasetStore()

const org = orgStore.getOrAdd(organizationId)

const currentPage = ref(1)
const pages = computed(() => datasetStore.getDatasetsPaginationForOrg(organizationId))
const datasets = computed(() => datasetStore.getOrAddDatasetsForOrg(organizationId, currentPage.value))

function onUpdatePage (page) {
  currentPage.value = page + 1
}
</script>

<template>
  <h1>{{ org.name }}</h1>
  <div>{{ org.description }}</div>
  <h2>Jeux de données</h2>
  <ul>
    <li v-for="d in datasets.data">{{ d.title }}</li>
  </ul>
  <DsfrPagination v-if="pages.length" :current-page="currentPage - 1" :pages="pages" @update:current-page="onUpdatePage" />
</template>
