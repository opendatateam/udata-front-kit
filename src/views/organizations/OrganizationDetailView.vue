<script setup>
import { useRoute } from "vue-router"
import { computed, ref } from "vue"

import { useOrganizationStore, useDatasetStore } from "../../store"
import Card from "../../components/Card.vue"

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
  <div class="fr-container--fluid fr-mt-4w fr-mb-4w">
    <h1>{{ org.name }}</h1>
    <div>{{ org.description }}</div>
    <h2 class="fr-mt-2w">Jeux de données</h2>
    <div class="fr-grid-row fr-grid-row--gutters">
      <Card v-for="d in datasets.data"
        class="fr-card--horizontal fr-card--sm fr-col-5 fr-m-2w"
        type="dataset"
        :alt-img="d.title"
        :link="`/datasets/${d.slug}`"
        :title="d.title"
        :description="d.description"
        :img="d.organization.logo"
      />
    </div>
  </div>
  <DsfrPagination v-if="pages.length" :current-page="currentPage - 1" :pages="pages" @update:current-page="onUpdatePage" />
</template>
