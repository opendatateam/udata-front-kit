<script setup lang="ts">
import { isAvailable } from '@/custom/ecospheres/utils/bouquet'
import type { DatasetProperties } from '@/model/topic'

const missingData = 'Non disponible'

const props = defineProps({
  datasetProperties: {
    type: Object as () => DatasetProperties,
    required: true
  }
})
</script>

<template>
  <DsfrTag
    v-if="!isAvailable(props.datasetProperties.availability)"
    class="uppercase bold"
    :label="missingData"
  />
</template>

<style scoped lang="scss">
.fr-tag {
  font-size: 0.8rem;
  color: #6e445a;
  background-color: #fee7fc;
  border-radius: 0;
}
</style>
