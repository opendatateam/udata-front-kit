<template>
  <div class="fr-text--sm">
    <a
      :href="`https://www.data.gouv.fr/fr/${datagouvType}/${apiOrDataset.UID_datagouv}`"
      target="_blank"
      >{{ apiOrDataset.Nom }}</a
    >
    <!-- eslint-disable vue/no-v-html -->
    <div
      v-if="customDescription && customDescription.length > 0"
      class="fr-text--sm"
      v-html="fromMarkdown(customDescription).html"
    ></div>
    <!-- eslint-enable vue/no-v-html -->
  </div>
</template>

<script setup lang="ts">
import { fromMarkdown } from '@/utils'
import type { ApiOrDataset } from '../model/grist'

const props = defineProps<{
  apiOrDataset: ApiOrDataset
  customDescription?: string
}>()

const apiOrDataset = props.apiOrDataset

const datagouvType = computed(() => {
  switch (apiOrDataset.Type) {
    case 'API':
      return 'dataservices'
    case 'Jeu de données':
      return 'datasets'
    default:
      throw new Error(`Unknown api or dataset type: ${apiOrDataset.Type}`)
  }
})
</script>

<style scoped>
.fr-text--sm :deep(p) {
  font-size: inherit;
  line-height: inherit;
}
</style>

