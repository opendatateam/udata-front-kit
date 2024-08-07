<script setup lang="ts">
import type { DatasetV2 } from '@etalab/data.gouv.fr-components'
import { ref, onMounted, computed } from 'vue'
import { toast } from 'vue3-toastify'
import { useLoading } from 'vue-loading-overlay'

import Tooltip from '@/components/TooltipWrapper.vue'
import { Availability, type DatasetProperties, type Topic } from '@/model/topic'
import { useTopicStore } from '@/store/TopicStore'

import DatasetPropertiesTextFields from '../forms/dataset/DatasetPropertiesTextFields.vue'

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
  return (
    datasetProperties.value.title.trim() !== '' &&
    datasetProperties.value.purpose.trim() !== '' &&
    !!selectedBouquetId.value
  )
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
  const datasetsProperties = bouquet.extras.ecospheres.datasets_properties
  return datasetsProperties.some(
    (datasetProps) => datasetProps.id === props.dataset.id
  )
}

const submit = async () => {
  if (selectedBouquetId.value === null) {
    throw Error('Trying to attach to bouquet without id')
  }
  const bouquet = topicStore.get(selectedBouquetId.value)
  if (bouquet === undefined) {
    throw Error('Bouquet not in store')
  }
  const newDatasetsProperties =
    bouquet.extras.ecospheres.datasets_properties || []
  newDatasetsProperties.push(datasetProperties.value)
  bouquet.extras.ecospheres.datasets_properties = newDatasetsProperties
  await topicStore.update(bouquet.id, {
    id: bouquet.id,
    tags: bouquet.tags,
    extras: bouquet.extras
  })
  toast(`Jeu de données ajouté avec succès au bouquet "${bouquet.name}"`, {
    type: 'success'
  })
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
    title="Ajouter le jeu de données à un bouquet"
    :opened="show"
    :actions="modalActions"
    @close="closeModal"
  >
    <DsfrSelect
      v-model="selectedBouquetId"
      :options="bouquetOptions"
      default-unselected-text="Choisissez un bouquet"
    >
      <template #label>
        Bouquet à associer <span class="required">&nbsp;*</span>
        <Tooltip
          text="Choisissez parmi les bouquets dont vous êtes l'auteur. Si un bouquet apparait désactivé, c'est que le jeu de données y est déjà associé."
        />
      </template>
    </DsfrSelect>
    <DatasetPropertiesTextFields
      v-model:dataset-properties="datasetProperties"
    />
  </DsfrModal>
</template>
