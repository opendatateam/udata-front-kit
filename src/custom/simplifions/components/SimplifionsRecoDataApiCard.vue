<template>
  <div>
    <a
      :href="`https://www.data.gouv.fr/fr/datasets/${apiOrData.UID_data_gouv}`"
      target="_blank"
      >{{ apiOrData.Nom_donnees_ou_API }}</a
    >
    <p v-if="customDescription">{{ customDescription }}</p>
  </div>
</template>

<script setup lang="ts">
import type { SimplifionsDataOrApi } from '../model/cas_usage'

defineProps<{
  apiOrData: SimplifionsDataOrApi
  customDescription?: string
}>()
</script>
