<template>
  <div v-if="numberOfDatasets < 1" class="no-dataset">
    <p>Ce bouquet ne contient pas encore de jeux de données</p>
  </div>
  <div v-else>
    <DsfrAccordionsGroup>
      <!-- conditionnal draggable wrapper component -->
      <component
        :is="isEdit ? 'draggable' : 'div'"
        :list="isEdit ? datasets : null"
        :ghost-class="isEdit ? 'ghost' : null"
      >
        <li v-for="(dataset, index) in datasets" :key="index">
          <DsfrAccordion
            :id="getAccordeonId(index)"
            :expanded-id="isExpanded[getAccordeonId(index)]"
            :class="{ draggable: isEdit }"
            @expand="isExpanded[getAccordeonId(index)] = $event"
          >
            <template #title>
              <BouquetDatasetAccordionTitle
                :dataset-properties="dataset"
                :is-edit="isEdit"
              />
            </template>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div v-html="markdown(dataset.purpose)"></div>
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
                v-if="!isAvailable(dataset)"
                class="fr-btn fr-btn--secondary inline-flex"
                :href="`mailto:${email}`"
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

<script lang="ts">
import { VueDraggableNext } from 'vue-draggable-next'

import config from '@/config'
import { type DatasetProperties, isAvailable as isAvailableTest } from '@/model'
import { fromMarkdown } from '@/utils'

import BouquetDatasetAccordionTitle from './BouquetDatasetAccordionTitle.vue'
import DatasetPropertiesFields from './forms/dataset/DatasetPropertiesFields.vue'

export const getDatasetListTitle = function (
  datasets: DatasetProperties[],
  title: string = 'Composition du bouquet'
): string {
  const numberOfDatasets = datasets.length
  switch (numberOfDatasets) {
    case 0: {
      return title
    }
    case 1: {
      return `${title} ( 1 jeu de données )`
    }
    default: {
      return `${title} ( ${numberOfDatasets} jeux de données )`
    }
  }
}

export default {
  name: 'BouquetDatasetList',
  components: {
    BouquetDatasetAccordionTitle,
    DatasetPropertiesFields,
    draggable: VueDraggableNext
  },
  props: {
    datasets: {
      type: Array<DatasetProperties>,
      default: []
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  emits: ['removeDataset', 'editDataset'],
  data() {
    return {
      isExpanded: {} as { [key: string]: boolean },
      isModalOpen: false,
      editedDataset: {
        index: undefined as number | undefined,
        data: undefined as DatasetProperties | undefined,
        isValid: false
      }
    }
  },
  computed: {
    modalActions() {
      return [
        {
          label: 'Valider',
          disabled: !this.editedDataset.isValid,
          onClick: ($event: PointerEvent) => {
            $event.preventDefault()
            this.$emit('editDataset', { ...this.editedDataset })
            this.closeModal()
          }
        },
        {
          label: 'Annuler',
          secondary: true,
          onClick: () => {
            this.closeModal()
          }
        }
      ]
    },
    email() {
      return config.website.contact_email
    },
    numberOfDatasets(): number {
      return this.datasets.length
    }
  },
  methods: {
    getAccordeonId(index: number): string {
      return `accordion_${index}`
    },
    isAvailable(dataset: DatasetProperties): boolean {
      return isAvailableTest(dataset.availability)
    },
    markdown(value: string) {
      return fromMarkdown(value)
    },
    editDataset(dataset: DatasetProperties, index: number) {
      // clone the object to enable cancellation
      this.editedDataset = { index, data: { ...dataset }, isValid: false }
      this.isModalOpen = true
    },
    closeModal() {
      this.isModalOpen = false
    }
  }
}
</script>

<style scoped lang="scss">
.ghost {
  background-color: #bbb;
}
</style>
