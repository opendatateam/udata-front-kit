<script setup>
import { useRoute } from "vue-router"
import { computed } from "vue"

import { useOrganizationStore, useDatasetStore } from "../../store"

const route = useRoute()
const organizationId = route.params.oid

const orgStore = useOrganizationStore()
const datasetStore = useDatasetStore()

const fetchDatasets = true
const org = orgStore.getOrAdd(organizationId, fetchDatasets)
const datasets = computed(() => datasetStore.datasetsForOrg(organizationId))
</script>

<template>
  <h1>{{ org.name }}</h1>
  <div>{{ org.description }}</div>
  <h2>Jeux de données</h2>
  <ul>
    <li v-for="d in datasets">{{ d.title }}</li>
  </ul>
</template>
