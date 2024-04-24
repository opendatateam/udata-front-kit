<script setup lang="ts">
import { ref, computed, onMounted, type Ref, type ComputedRef } from 'vue'
import { useLoading } from 'vue-loading-overlay'
import { useRouter } from 'vue-router'

import DatasetPropertiesFields from '@/custom/ecospheres/components/forms/dataset/DatasetPropertiesFields.vue'
import { type DatasetProperties, type Topic, Availability } from '@/model'
import { useRouteParamsAsString } from '@/router/utils'
import { useTopicStore } from '@/store/TopicStore'

const route = useRouteParamsAsString()
const router = useRouter()

const initData = (): DatasetProperties => {
  return {
    title: '',
    purpose: '',
    availability: Availability.NOT_AVAILABLE,
    uri: null,
    id: null
  }
}

const topic: Ref<Topic | null> = ref(null)
const datasetProperties = ref(initData())
const isValidDataset = ref(false)

const alreadySelectedDatasets: ComputedRef<DatasetProperties[]> = computed(
  () => {
    if (topic.value === null) return []
    return topic.value.extras['ecospheres:datasets_properties']
  }
)

const handleSubmit = () => {
  if (topic.value === null) {
    throw Error('Trying to update null topic')
  }
  const loader = useLoading().show()
  const datasetsProperties =
    topic.value.extras['ecospheres:datasets_properties'] || []
  datasetsProperties.push(datasetProperties.value)
  const topicData = {
    id: topic.value.id,
    tags: topic.value.tags,
    extras: {
      ...topic.value.extras,
      'ecospheres:datasets_properties': datasetsProperties
    }
  }
  useTopicStore()
    .update(topic.value.id, topicData)
    .then((response) => {
      router.push({ name: 'bouquet_edit', params: { bid: response.id } })
    })
    .finally(() => loader.hide())
}

onMounted(() => {
  const loader = useLoading().show()
  useTopicStore()
    .load(route.params.bid)
    .then((_topic) => {
      topic.value = _topic
    })
    .finally(() => loader.hide())
})
</script>

<template>
  <div class="fr-container fr-mt-4w fr-mb-4w">
    <form @submit.prevent="handleSubmit">
      <h1>Ajouter un jeu de données</h1>
      <DatasetPropertiesFields
        v-model:dataset-properties="datasetProperties"
        :already-selected-datasets="alreadySelectedDatasets"
        @update-validation="(isValid: boolean) => isValidDataset = isValid"
      />
      <DsfrButton
        :disabled="!isValidDataset"
        type="submit"
        label="Ajouter ce jeu de données"
        :secondary="true"
      />
    </form>
  </div>
</template>
