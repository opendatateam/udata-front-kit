<script setup>
import { marked } from "marked"
import { filesize } from "filesize"

import { computed, onMounted, ref, watch } from "vue"
import { useRoute } from "vue-router"

import { useDatasetStore } from "../../store/DatasetStore"
import { useReuseStore } from "../../store/ReuseStore"
import Card from "../../components/Card.vue"

const route = useRoute()
const datasetId = route.params.did

const datasetStore = useDatasetStore()
const reuseStore = useReuseStore()

const dataset = computed(() => datasetStore.get(datasetId) || {})
const reuses = ref([])

const formatFileSize = (fileSize) => {
  if (!fileSize) return "Taille inconnue"
  return filesize(fileSize)
}

const files = computed(() => {
  return dataset.value?.resources?.map(resource => {
    return {
      title: resource.title || "Fichier sans nom",
      format: resource.format,
      size: formatFileSize(resource.filesize),
      href: resource.url,
    }
  })
})

const description = computed(() => {
  if (dataset.value?.description) {
    return marked.parse(dataset.value.description, {mangle: false, headerIds: false})
  }
})

// launch reuses fetch as soon as we have the technical id
watch(dataset, _dataset => {
  if (_dataset?.id) reuseStore.loadReusesForDataset(_dataset.id).then((r) => reuses.value = r)
})

onMounted(() => {
  datasetStore.load(datasetId)
})
</script>

<template>
  <h1>{{ dataset.title }}</h1>
  <div v-html="description"></div>
  <DsfrFileDownloadList
    class="fr-mt-4w"
    :files="files"
    title="Fichiers du jeu de données"
  />

  <h2 class="fr-mt-4w">Réutilisations</h2>
  <div v-if="!reuses.length">Pas de réutilisation pour ce jeu de données.</div>
  <div class="fr-grid-row fr-grid-row--gutters">
    <Card v-for="r in reuses"
      class="fr-card--horizontal fr-card--sm fr-col-5 fr-m-2w"
      type="dataset"
      :alt-img="r.title"
      :external-link="r.page"
      :title="r.title"
      :description="r.description"
      :img="r.organization?.logo || r.owner.avatar"
    />
  </div>
</template>
