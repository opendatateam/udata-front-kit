<template>
  <ul
    class="fr-grid-row fr-grid-row--gutters fr-mt-3w list-none fr-pb-2w"
    :class="{ 'scrollable-list': dataApiList.length > 3 }"
  >
    <li
      v-for="apidOrData in dataApiList"
      :key="apidOrData.UID_data_gouv"
      class="fr-col-12 fr-py-0 fr-mt-2w"
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

defineProps<{
  dataApiList: Array<SimplifionsDataOrApi>
  customDescriptions?: Record<string, string>
}>()
</script>

<style scoped>
ul.list-none {
  list-style: none;
}

.scrollable-list {
  overflow-x: auto;
  max-height: calc(100vh - 50px);
  border: 1px solid #e4e4e4;
}
</style>
