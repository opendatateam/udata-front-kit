<template>
  <div>
    <a
      :href="`https://www.data.gouv.fr/fr/datasets/${apiOrData.UID_data_gouv}`"
      target="_blank"
      >{{ apiOrData.Nom_donnees_ou_API }}</a
    >
    <p v-if="customDescription">{{ customDescription }}</p>
    <!-- eslint-disable vue/no-v-html -->
    <div
      v-if="customDescription && customDescription.length > 0"
      v-html="fromMarkdown(customDescription)"
    ></div>
    <!-- eslint-enable vue/no-v-html -->
  </div>
</template>

<script setup lang="ts">
import { fromMarkdown } from '@/utils'
import type { SimplifionsDataOrApi } from '../model/cas_usage'

defineProps<{
  apiOrData: SimplifionsDataOrApi
  customDescription?: string
}>()
</script>
