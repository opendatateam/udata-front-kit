<script setup lang="ts">
import type { DatasetProperties } from '@/model'
import { isAvailable, Availability } from '@/model'

const missingData = 'Donnée manquante'
const notFoundData = 'Donnée non disponible'

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
    :label="`${
      props.datasetProperties.availability === Availability.NOT_AVAILABLE
        ? missingData
        : props.datasetProperties.availability === Availability.MISSING
        ? notFoundData
        : ''
    }`"
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
