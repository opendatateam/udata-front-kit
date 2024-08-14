<script setup lang="ts">
import type { DatasetV2 } from '@datagouv/components'
import { ref, onMounted, computed } from 'vue'
import { toast } from 'vue3-toastify'
import { useLoading } from 'vue-loading-overlay'

import Tooltip from '@/components/TooltipWrapper.vue'
import DatasetPropertiesTextFields from '@/components/forms/dataset/DatasetPropertiesTextFields.vue'
import { Availability, type DatasetProperties, type Topic } from '@/model/topic'
import { useTopicStore } from '@/store/TopicStore'
import { capitalize } from '@/utils'
import { useTopicsConf } from '@/utils/config'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  dataset: {
    type: Object as () => DatasetV2,
    required: true
  }
})

const emit = defineEmits(['update:show'])
const loader = useLoading()
const topicStore = useTopicStore()

const { topicsName, topicsExtrasKey, topicsDatasetEditorialization } =
  useTopicsConf()

const bouquets = topicStore.myTopics
const datasetProperties = ref<DatasetProperties>({
  title: '',
  purpose: '',
  id: props.dataset.id,
  uri: `/datasets/${props.dataset.id}`,
  availability: Availability.LOCAL_AVAILABLE
})
const selectedBouquetId = ref(null)

const bouquetOptions = computed(() => {
  return bouquets.value.map((bouquet) => {
    return {
      value: bouquet.id,
      text: bouquet.name,
      disabled: isDatasetInBouquet(bouquet)
    }
  })
})

const isValid = computed(() => {
  if (topicsDatasetEditorialization) {
    return (
      datasetProperties.value.title.trim() !== '' &&
      datasetProperties.value.purpose.trim() !== '' &&
      !!selectedBouquetId.value
    )
  } else {
    return !!selectedBouquetId.value
  }
})

const modalActions = computed(() => {
  return [
    {
      label: 'Enregistrer',
      disabled: !isValid.value,
      onClick: () => submit()
    },
    {
      label: 'Annuler',
      secondary: true,
      onClick: () => closeModal()
    }
  ]
})

const isDatasetInBouquet = (bouquet: Topic): boolean => {
  const datasetsProperties = bouquet.extras[topicsExtrasKey].datasets_properties
  return datasetsProperties.some(
    (datasetProps: any) => datasetProps.id === props.dataset.id
  )
}

const submit = async () => {
  if (selectedBouquetId.value === null) {
    throw Error('Trying to attach to topic without id')
  }
  const bouquet = topicStore.get(selectedBouquetId.value)
  if (bouquet === undefined) {
    throw Error('Topic not in store')
  }
  const newDatasetsProperties =
    bouquet.extras[topicsExtrasKey].datasets_properties || []
  newDatasetsProperties.push(datasetProperties.value)
  bouquet.extras[topicsExtrasKey].datasets_properties = newDatasetsProperties
  await topicStore.update(bouquet.id, {
    id: bouquet.id,
    tags: bouquet.tags,
    extras: bouquet.extras
  })
  toast(
    `Jeu de données ajouté avec succès au ${topicsName} "${bouquet.name}"`,
    {
      type: 'success'
    }
  )
  closeModal()
}

const closeModal = () => {
  emit('update:show', false)
}

onMounted(() => {
  const loading = loader.show()
  topicStore.loadTopicsForUniverse().then(() => loading.hide())
})
</script>

<template>
  <DsfrModal
    v-if="show"
    size="lg"
    :title="'Ajouter le jeu de données à un ' + topicsName"
    :opened="show"
    :actions="modalActions"
    @close="closeModal"
  >
    <DsfrSelect
      v-model="selectedBouquetId"
      :options="bouquetOptions"
      :default-unselected-text="'Choisissez un ' + topicsName"
    >
      <template #label>
        {{ capitalize(topicsName) }} à associer
        <span class="required">&nbsp;*</span>
        <Tooltip
          :text="
            'Choisissez parmi les ' +
            topicsName +
            's dont vous êtes l\'auteur. Si un ' +
            topicsName +
            ' apparait désactivé, c\'est que le jeu de données y est déjà associé.'
          "
        />
      </template>
    </DsfrSelect>

    <DatasetPropertiesTextFields
      v-if="topicsDatasetEditorialization"
      v-model:dataset-properties="datasetProperties"
    />
  </DsfrModal>
</template>
