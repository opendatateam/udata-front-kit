<script setup lang="ts">
import type { DatasetProperties } from '@/model'

import BouquetDatasetAvailability from './BouquetDatasetAvailability.vue'

defineProps({
  datasetProperties: {
    type: Object as () => DatasetProperties,
    required: true
  },
  isEdit: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <div class="title-container">
    <div>
      <VIcon v-if="isEdit" name="md-dragindicator" />
      <span :class="{ 'fr-ml-2w': isEdit }">{{ datasetProperties.title }}</span>
    </div>
    <BouquetDatasetAvailability
      class="fr-mr-2w"
      :dataset-properties="datasetProperties"
    />
  </div>
</template>

<style scoped lang="scss">
.title-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
</style>
