<script setup lang="ts">
import { type DatasetV2 } from '@datagouv/components'
import { ref, watch, toRef, type Ref } from 'vue'

import type { DatasetProperties } from '@/model/topic'
import { useDatasetStore } from '@/store/DatasetStore'
import { isAvailable } from '@/utils/bouquet'
import { toastHttpError } from '@/utils/error'
import { isNotFoundError } from '@/utils/http'

const props = defineProps({
  datasetProperties: {
    type: Object as () => DatasetProperties,
    required: true
  },
  isEdit: {
    type: Boolean,
    default: false
  }
})
const datasetPropertiesRef = toRef(props, 'datasetProperties')
const dataset: Ref<DatasetV2 | undefined> = ref()

watch(
  datasetPropertiesRef,
  () => {
    if (
      datasetPropertiesRef.value.id &&
      !datasetPropertiesRef.value.remoteDeleted
    ) {
      useDatasetStore()
        .load(datasetPropertiesRef.value.id, { toasted: false })
        .then((d) => {
          dataset.value = d
        })
        .catch((err) => {
          if (isNotFoundError(err)) {
            datasetPropertiesRef.value.remoteDeleted = true
          } else {
            toastHttpError(err)
          }
        })
    }
  },
  { immediate: true }
)
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
        datasetProperties.remoteDeleted ||
        !!dataset?.archived
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
