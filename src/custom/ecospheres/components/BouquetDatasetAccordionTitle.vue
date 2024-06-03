<script setup lang="ts">
import type { DatasetProperties } from '@/model/topic'

import { isAvailable } from '../utils/bouquet'

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
    <DsfrTag
      v-if="
        !isAvailable(datasetProperties.availability) ||
        datasetProperties.remoteDeleted
      "
      class="uppercase bold fr-mr-2w"
      label="Non disponible"
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

.fr-tag {
  font-size: 0.8rem;
  color: #6e445a;
  background-color: #fee7fc;
  border-radius: 0;
}
</style>
