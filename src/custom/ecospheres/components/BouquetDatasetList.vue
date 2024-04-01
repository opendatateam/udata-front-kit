<script setup lang="ts">
import { computed, ref, type Ref } from 'vue'
import { VueDraggableNext as draggable } from 'vue-draggable-next'

import config from '@/config'
import { type DatasetProperties, isAvailable } from '@/model'
import { fromMarkdown } from '@/utils'

import BouquetDatasetAccordionTitle from './BouquetDatasetAccordionTitle.vue'
import DatasetPropertiesFields from './forms/dataset/DatasetPropertiesFields.vue'

const props = defineProps({
  datasets: {
    type: Array<DatasetProperties>,
    default: []
  },
  isEdit: {
    type: Boolean,
    default: false
  }
})

const emits = defineEmits(['removeDataset', 'editDataset'])

const expandStore: Ref<{ [key: string]: string | null }> = ref({})
const isModalOpen = ref(false)
const editedDataset = ref({
  index: undefined as number | undefined,
  data: undefined as DatasetProperties | undefined,
  isValid: false
})

const expandedIds = computed(() => {
  return Object.keys(expandStore.value).filter((k) => !!expandStore.value[k])
})

const modalActions = computed(() => {
  return [
    {
      label: 'Valider',
      disabled: !editedDataset.value.isValid,
      onClick: ($event: PointerEvent) => {
        $event.preventDefault()
        emits('editDataset', { ...editedDataset.value })
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

const expandAll = () => {
  for (const [idx] of props.datasets.entries()) {
    expandStore.value[getAccordeonId(idx)] = getAccordeonId(idx)
  }
}

const collapseAll = () => {
  expandStore.value = {}
}

const getAccordeonId = (index: number): string => {
  return `accordion_${index}`
}

const editDataset = (dataset: DatasetProperties, index: number) => {
  // clone the object to enable cancellation
  editedDataset.value = { index, data: { ...dataset }, isValid: false }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}
</script>

<template>
  <div v-if="datasets.length < 1" class="no-dataset">
    <p>Ce bouquet ne contient pas encore de jeux de données</p>
  </div>
  <div v-else>
    <div class="align-right fr-mb-1v small">
      <a
        v-if="expandedIds.length !== datasets.length"
        href="#"
        @click.stop.prevent="expandAll"
        >Tout déplier</a
      >
      <a v-else href="#" @click.stop.prevent="collapseAll">Tout replier</a>
    </div>
    <DsfrAccordionsGroup>
      <!-- conditionnal draggable wrapper component -->
      <component
        :is="isEdit ? draggable : 'div'"
        :list="isEdit ? datasets : null"
        :ghost-class="isEdit ? 'ghost' : null"
      >
        <li v-for="(dataset, index) in datasets" :key="index">
          <DsfrAccordion
            :id="getAccordeonId(index)"
            :expanded-id="expandStore[getAccordeonId(index)]"
            :class="{ draggable: isEdit }"
            @expand="expandStore[getAccordeonId(index)] = $event"
          >
            <template #title>
              <BouquetDatasetAccordionTitle
                :dataset-properties="dataset"
                :is-edit="isEdit"
              />
            </template>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div v-html="fromMarkdown(dataset.purpose)"></div>
            <div class="button__wrapper">
              <DsfrButton
                v-if="isEdit"
                icon="ri-pencil-line"
                label="Éditer"
                class="fr-mr-2w"
                @click.prevent="editDataset(dataset, index)"
              />
              <DsfrButton
                v-if="isEdit"
                icon="ri-delete-bin-line"
                label="Retirer de la section"
                class="fr-mr-2w"
                @click.prevent="$emit('removeDataset', index)"
              />
              <a
                v-if="!isAvailable(dataset.availability)"
                class="fr-btn fr-btn--secondary inline-flex"
                :href="`mailto:${config.website.contact_email}`"
              >
                Aidez-nous à trouver la donnée</a
              >
              <a
                v-if="dataset.uri"
                class="fr-btn fr-btn--secondary inline-flex"
                :href="dataset.uri"
                target="_blank"
                >Accéder au catalogue</a
              >
            </div>
          </DsfrAccordion>
        </li>
      </component>
    </DsfrAccordionsGroup>
    <DsfrModal
      v-if="isEdit && isModalOpen && editedDataset.data"
      size="lg"
      title="Éditer le jeu de données"
      :opened="isModalOpen"
      :actions="modalActions"
      @close="closeModal"
    >
      <DatasetPropertiesFields
        v-model:dataset-properties="editedDataset.data"
        :already-selected-datasets="datasets"
        @update-validation="(isValid: boolean) => editedDataset.isValid = isValid"
      />
    </DsfrModal>
  </div>
</template>

<style scoped lang="scss">
.ghost {
  background-color: #bbb;
}
</style>
