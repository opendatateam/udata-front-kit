<script setup>
import { marked } from "marked"
import { filesize } from "filesize"

import { useRoute } from "vue-router"

import { useDatasetStore } from "../../store/DatasetStore"
import { computed, onMounted } from "vue"

const route = useRoute()
const datasetId = route.params.did

const store = useDatasetStore()

const dataset = computed(() => store.get(datasetId) || {})

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

onMounted(() => {
  store.load(datasetId)
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
</template>
