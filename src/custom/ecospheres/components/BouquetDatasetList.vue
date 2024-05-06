<script setup lang="ts">
import { computed, ref, type Ref } from 'vue'
import { VueDraggableNext as draggable } from 'vue-draggable-next'

import config from '@/config'
import { type DatasetProperties, isAvailable } from '@/model'
import { fromMarkdown } from '@/utils'

import BouquetDatasetAccordionTitle from './BouquetDatasetAccordionTitle.vue'
import BouquetDatasetCard from './BouquetDatasetCard.vue'
import BouquetDatasetListExport from './BouquetDatasetListExport.vue'
import DatasetPropertiesFields from './forms/dataset/DatasetPropertiesFields.vue'

const props = defineProps({
  datasets: {
    type: Array<DatasetProperties>,
    default: []
  },
  bouquetId: {
    type: String,
    required: true
  },
  isEdit: {
    type: Boolean,
    default: false
  }
})

const emits = defineEmits(['removeDataset', 'editDataset', 'reorderDatasets'])

const isReorder = ref(false)
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
        // TODO: save dataset for real
        // do it here or bubble up to detail view?
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

const addDataset = () => {
  console.log('addDataset')
}

const saveOrder = () => {
  // TODO: save for real
  // bubble up or do it here?
  console.log('saveOrder')
  isReorder.value = false
}

const cancelReorder = () => {
  // TODO: handle revert somehow, keep previous order in local var?
  console.log('cancelReorder')
  isReorder.value = false
}
</script>

<template>
  <!-- Header and buttons -->
  <div
    v-if="!isReorder"
    class="fr-grid-row fr-grid-row--gutters fr-grid-row--middle justify-between fr-pb-1w"
  >
    <h2 class="fr-col-auto fr-mb-2v">Composition du bouquet de données</h2>
    <div class="fr-col-auto fr-grid-row fr-grid-row--middle">
      <DsfrButton
        v-if="isEdit"
        secondary
        size="sm"
        class="fr-mb-1w"
        label="Réorganiser la liste"
        icon="md-dragindicator"
        @click.prevent="isReorder = true"
      />
      <DsfrButton
        v-if="isEdit"
        size="sm"
        class="fr-mb-1w fr-ml-1w"
        label="Ajouter un jeu de données"
        icon="ri-add-line"
        @click.prevent="addDataset"
      />
    </div>
  </div>
  <div
    v-else
    class="fr-grid-row fr-grid-row--gutters fr-grid-row--middle justify-between fr-pb-1w"
  >
    <h2 class="fr-col-auto fr-mb-2v">Réorganiser la liste</h2>
    <div class="fr-col-auto fr-grid-row fr-grid-row--middle">
      <DsfrButton
        secondary
        size="sm"
        class="fr-mb-1w"
        label="Annuler"
        @click.prevent="cancelReorder"
      />
      <DsfrButton
        size="sm"
        class="fr-mb-1w fr-ml-1w"
        label="Enregister"
        @click.prevent="saveOrder"
      />
    </div>
  </div>
  <!-- Actual datasets list -->
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
        :is="isReorder ? draggable : 'div'"
        :list="isReorder ? datasets : null"
        :ghost-class="isReorder ? 'ghost' : null"
        @change="isReorder ? emits('reorderDatasets') : null"
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
                :is-edit="isReorder"
              />
            </template>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div v-html="fromMarkdown(dataset.purpose)"></div>
            <!-- FIXME: does not refresh when changing dataset from edit modal -->
            <BouquetDatasetCard v-if="dataset.id" :dataset-id="dataset.id" />
            <div class="button__wrapper">
              <DsfrButton
                v-if="isEdit"
                size="sm"
                icon="ri-pencil-line"
                label="Éditer"
                class="fr-mr-2w"
                @click.prevent="editDataset(dataset, index)"
              />
              <DsfrButton
                v-if="isEdit"
                size="sm"
                icon="ri-delete-bin-line"
                label="Retirer de la section"
                class="fr-mr-2w"
                @click.prevent="$emit('removeDataset', index)"
              />
              <a
                v-if="!isAvailable(dataset.availability)"
                class="fr-btn fr-btn--sm fr-btn--secondary inline-flex"
                :href="`mailto:${config.website.contact_email}`"
              >
                Aidez-nous à trouver la donnée</a
              >
              <a
                v-if="dataset.uri && !dataset.id"
                class="fr-btn fr-btn--sm fr-btn--secondary inline-flex"
                :href="dataset.uri"
                target="_blank"
                >Accéder au catalogue</a
              >
            </div>
          </DsfrAccordion>
        </li>
      </component>
    </DsfrAccordionsGroup>
  </div>

  <!-- Export list button -->
  <BouquetDatasetListExport :datasets="datasets" :filename="bouquetId" />

  <!-- add/edit modal -->
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
</template>

<style scoped lang="scss">
.ghost {
  background-color: #bbb;
}
</style>
