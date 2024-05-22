<script setup lang="ts">
import { ref, computed, defineModel, type Ref } from 'vue'

import type { DatasetModalData } from '@/model/dataset'
import { Availability, type DatasetProperties } from '@/model/topic'

import DatasetPropertiesFields from './DatasetPropertiesFields.vue'

export interface DatasetEditModalType {
  addDataset: () => void
  editDataset: (dataset: DatasetProperties, index: number) => void
}

const emits = defineEmits(['submitModal'])

const datasets = defineModel({
  type: Object as () => DatasetProperties[],
  required: true
})

const isModalOpen = ref(false)
const modalData: Ref<DatasetModalData> = ref({
  isValid: false,
  mode: 'edit'
})

const modalActions = computed(() => {
  return [
    {
      label: 'Enregistrer',
      disabled: !modalData.value.isValid,
      onClick: ($event: PointerEvent) => {
        $event.preventDefault()
        submitModal(modalData.value)
        closeModal()
      }
    },
    {
      label: 'Annuler',
      secondary: true,
      onClick: () => {
        closeModal()
      }
    }
  ]
})

const editDataset = (dataset: DatasetProperties, index: number) => {
  // clone the object to enable cancellation
  modalData.value = {
    index,
    dataset: { ...dataset },
    isValid: false,
    mode: 'edit'
  }
  isModalOpen.value = true
}

const addDataset = () => {
  modalData.value = {
    index: undefined,
    dataset: {
      title: '',
      purpose: '',
      availability: Availability.LOCAL_AVAILABLE,
      uri: null,
      id: null
    },
    isValid: false,
    mode: 'create'
  }
  isModalOpen.value = true
}

// move to parent
const submitModal = (modalData: DatasetModalData) => {
  if (modalData.dataset !== undefined) {
    if (modalData.mode === 'create') {
      datasets.value.push(modalData.dataset)
    } else if (modalData.mode === 'edit' && modalData.index !== undefined) {
      datasets.value[modalData.index] = modalData.dataset
    }
  }
  emits('submitModal')
}

// call from parent
const closeModal = () => {
  isModalOpen.value = false
}

defineExpose({ addDataset, editDataset })
</script>

<template>
  <DsfrModal
    v-if="isModalOpen && modalData.dataset"
    size="lg"
    class="bouquet-dataset-modal"
    :title="
      modalData.mode === 'edit'
        ? 'Éditer le jeu de données'
        : 'Ajouter un jeu de données'
    "
    :opened="isModalOpen"
    :actions="modalActions"
    @close="closeModal"
  >
    <DatasetPropertiesFields
      v-model:dataset-properties="modalData.dataset"
      :already-selected-datasets="datasets"
      @update-validation="(isValid: boolean) => modalData.isValid = isValid"
    />
  </DsfrModal>
</template>

<style lang="scss">
.bouquet-dataset-modal {
  h1 {
    margin-bottom: 1rem;
  }
}
</style>
