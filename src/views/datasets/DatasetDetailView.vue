<script setup>
import { marked } from "marked"

import { useRoute } from "vue-router"

import { useDatasetStore } from "../../store"
import { computed } from "vue"

const route = useRoute()
const datasetId = route.params.did

const store = useDatasetStore()
const dataset = store.getOrAdd(datasetId)

const files = computed(() => {
  // FIXME: sometimes value, sometimes no value...
  return dataset.value?.resources?.map(resource => {
    return {
      title: resource.title || "Fichier sans nom",
      format: resource.format,
      // TODO: convert to human readable
      size: resource.filesize || "Taille inconnue",
      href: resource.url,
    }
  })
})

const description = computed(() => {
  // FIXME: sometimes value, sometimes no value...
  if (dataset.value?.description) {
    return marked.parse(dataset.value.description, {mangle: false, headerIds: false})
  }
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
