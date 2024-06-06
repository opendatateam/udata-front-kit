<script setup lang="ts">
import { computed, ref, defineModel, type Ref } from 'vue'
import { VueDraggableNext as draggable } from 'vue-draggable-next'

import config from '@/config'
import { isAvailable } from '@/custom/ecospheres/utils/bouquet'
import { type DatasetProperties } from '@/model/topic'
import { fromMarkdown } from '@/utils'

import BouquetDatasetAccordionTitle from './BouquetDatasetAccordionTitle.vue'
import BouquetDatasetCard from './BouquetDatasetCard.vue'
import DatasetEditModal, {
  type DatasetEditModalType
} from './forms/dataset/DatasetEditModal.vue'

const datasets = defineModel({
  type: Array<DatasetProperties>,
  default: []
})

defineProps({
  isEdit: {
    type: Boolean,
    default: false
  }
})

const emits = defineEmits(['updateDatasets'])

const modal: Ref<DatasetEditModalType | null> = ref(null)
const isReorder = ref(false)
const expandStore: Ref<{ [key: string]: string | null }> = ref({})
// make a copy for local reordering before save
const originalDatasets = ref([...datasets.value])

const expandedIds = computed(() => {
  return Object.keys(expandStore.value).filter((k) => !!expandStore.value[k])
})

const expandAll = () => {
  for (const [idx] of datasets.value.entries()) {
    expandStore.value[getAccordeonId(idx)] = getAccordeonId(idx)
  }
}

const collapseAll = () => {
  expandStore.value = {}
}

const getAccordeonId = (index: number): string => {
  return `accordion_${index}`
}

const removeDataset = (index: number) => {
  if (
    window.confirm(
      'Etes-vous sûr de vouloir supprimer ce jeu de données du bouquet ?'
    )
  ) {
    delete expandStore.value[getAccordeonId(index)]
    datasets.value.splice(index, 1)
    emits('updateDatasets')
  }
}

const saveOrder = () => {
  isReorder.value = false
  emits('updateDatasets')
}

const cancelReorder = () => {
  datasets.value = [...originalDatasets.value]
  isReorder.value = false
}

const addDataset = () => {
  modal.value?.addDataset()
}

const editDataset = (dataset: DatasetProperties, index: number) => {
  modal.value?.editDataset(dataset, index)
}

const triggerReorder = () => {
  collapseAll()
  isReorder.value = true
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
        v-if="isEdit && datasets.length >= 2"
        secondary
        size="sm"
        class="fr-mb-1w"
        label="Réorganiser la liste"
        icon="md-dragindicator"
        @click.prevent="triggerReorder"
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
    <!-- Draggable list -->
    <div v-if="isReorder">
      <ul class="fr-accordions-group">
        <draggable ghost-class="ghost" :list="datasets">
          <li v-for="(dataset, index) in datasets" :key="index">
            <section class="fr-accordion draggable">
              <h3 class="fr-accordion__title">
                <button
                  class="fake__fr-accordion__btn fake__fr-accordion__btn__mq"
                >
                  <BouquetDatasetAccordionTitle
                    :dataset-properties="dataset"
                    :is-edit="true"
                  />
                </button>
              </h3>
            </section>
          </li>
        </draggable>
      </ul>
    </div>
    <!-- Static list -->
    <DsfrAccordionsGroup v-if="!isReorder">
      <li v-for="(dataset, index) in datasets" :key="index">
        <DsfrAccordion
          :id="getAccordeonId(index)"
          :expanded-id="expandStore[getAccordeonId(index)]"
          @expand="expandStore[getAccordeonId(index)] = $event"
        >
          <template #title>
            <BouquetDatasetAccordionTitle
              :dataset-properties="dataset"
              :is-edit="false"
            />
          </template>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-html="fromMarkdown(dataset.purpose)"></div>
          <BouquetDatasetCard v-if="dataset.id" :dataset-properties="dataset" />
          <div class="fr-grid-row">
            <DsfrButton
              v-if="isEdit"
              secondary
              size="sm"
              icon="ri-delete-bin-line"
              label="Supprimer"
              class="fr-mr-2w"
              @click.prevent="removeDataset(index)"
            />
            <DsfrButton
              v-if="isEdit"
              size="sm"
              icon="ri-pencil-line"
              label="Éditer"
              class="fr-mr-2w"
              @click.prevent="editDataset(dataset, index)"
            />
            <a
              v-if="!isAvailable(dataset.availability) && !isEdit"
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
    </DsfrAccordionsGroup>
  </div>

  <!-- add/edit modal -->
  <DatasetEditModal
    v-if="isEdit"
    ref="modal"
    v-model="datasets"
    @submit-modal="emits('updateDatasets')"
  />
</template>

<style scoped lang="scss">
.ghost {
  background-color: #bbb;
}

@media (min-width: 48em) {
  .fake__fr-accordion__btn.fake__fr-accordion__btn__mq {
    padding: 0.75rem 1rem;
  }
}

.fake__fr-accordion__btn {
  cursor: grab;
  align-items: center;
  display: inline-flex;
  flex-direction: row;
  font-size: 1rem;
  line-height: 1.5rem;
  margin: 0;
  max-height: none;
  max-width: 100%;
  min-height: 3rem;
  overflow: initial;
  padding: 0.75rem 0;
  text-align: left;
  width: 100%;
}
</style>
