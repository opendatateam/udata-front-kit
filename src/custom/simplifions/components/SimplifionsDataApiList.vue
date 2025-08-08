<template>
  <ul class="fr-grid-row fr-grid-row--gutters list-none fr-pt-2w">
    <li
      v-for="apidOrData in sortedDataApiList"
      :key="apidOrData.UID_data_gouv"
      class="fr-col-12 fr-py-0 fr-mb-2w"
    >
      <SimplifionsDataApiCard
        :api-or-data="apidOrData"
        :custom-description="customDescriptions?.[apidOrData.UID_data_gouv]"
      />
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { SimplifionsDataOrApi } from '../model/cas_usage'
import SimplifionsDataApiCard from './SimplifionsDataApiCard.vue'

const props = defineProps<{
  dataApiList: Array<SimplifionsDataOrApi>
  customDescriptions?: Record<string, string>
}>()

const sortedDataApiList = computed(() => {
  return [...props.dataApiList].sort((a, b) => {
    const aHasCustomDesc = !!props.customDescriptions?.[a.UID_data_gouv]
    const bHasCustomDesc = !!props.customDescriptions?.[b.UID_data_gouv]

    // Sort by custom description presence (true first), then alphabetically
    return (
      +bHasCustomDesc - +aHasCustomDesc ||
      a.Nom_donnees_ou_API.localeCompare(b.Nom_donnees_ou_API)
    )
  })
})
</script>

<style scoped>
ul.list-none {
  list-style: none;
}
</style>
