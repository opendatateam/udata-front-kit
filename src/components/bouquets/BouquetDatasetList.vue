<script setup lang="ts">
import { type DatasetV2 } from '@datagouv/components'
import { onMounted, ref, type Ref } from 'vue'

import DatasetEditModal, {
  type DatasetEditModalType
} from '@/components/forms/dataset/DatasetEditModal.vue'
import config from '@/config'
import { type DatasetProperties } from '@/model/topic'
import { useDatasetStore } from '@/store/DatasetStore'
import { fromMarkdown } from '@/utils'
import { isAvailable } from '@/utils/bouquet'
import { useTopicsConf } from '@/utils/config'
import { toastHttpError } from '@/utils/error'
import { isNotFoundError } from '@/utils/http'

import { useGroups } from '@/utils/bouquetGroups'
import DisclosureWidget from '../DisclosureWidget.vue'
import BouquetDatasetCard from './BouquetDatasetCard.vue'

const datasetsProperties = defineModel({
  type: Array<DatasetProperties>,
  default: []
})

defineProps({
  isEdit: {
    type: Boolean,
    default: false
  },
  datasetEditorialization: {
    type: Boolean,
    default: true
  }
})

const emits = defineEmits(['updateDatasets'])

const modal: Ref<DatasetEditModalType | null> = ref(null)
const datasetsContent = ref(new Map<string, DatasetV2>())

const { topicsName } = useTopicsConf()

const {
  groupedDatasets,
  getDatasetIndex,
  removeDatasetFromGroup,
  renameGroup,
  deleteGroup
} = useGroups(datasetsProperties)

const handleRemoveDataset = (group: string, index: number) => {
  removeDatasetFromGroup(group, index)
  emits('updateDatasets')
}

const handleRenameGroup = (oldGroupName: string, newGroupName: string) => {
  renameGroup(oldGroupName, newGroupName)
  emits('updateDatasets')
}

const handleDeleteGroup = (groupName: string) => {
  datasetsProperties.value = deleteGroup(groupName)
  emits('updateDatasets')
}

const loadDatasetsContent = () => {
  datasetsProperties.value.forEach((datasetItem) => {
    const id = datasetItem.id ?? null
    if (id && !datasetsContent.value.has(id) && !datasetItem.remoteDeleted) {
      useDatasetStore()
        .load(id, { toasted: false })
        .then((d) => {
          if (d) {
            datasetsContent.value.set(id, d)
            datasetItem.remoteArchived = !!d.archived
          }
        })
        .catch((err) => {
          if (isNotFoundError(err)) {
            datasetItem.remoteDeleted = true
          } else {
            toastHttpError(err)
          }
        })
    }
  })
}

const addDataset = () => {
  modal.value?.addDataset()
}

const editDataset = (
  dataset: DatasetProperties,
  index: number,
  group: string
) => {
  modal.value?.editDataset(dataset, getDatasetIndex(group, index))
}

const onDatasetEditModalSubmit = () => {
  emits('updateDatasets')
  loadDatasetsContent()
}

onMounted(() => {
  loadDatasetsContent()
})
</script>

<template>
  <!-- Header and buttons -->
  <div class="fr-grid-row fr-grid-row--middle justify-between">
    <h2 class="fr-col-auto fr-m-0 fr-p-0">
      Composition du {{ topicsName }} de données
    </h2>
    <div class="fr-col-auto fr-grid-row fr-grid-row--middle">
      <DsfrButton
        v-if="isEdit"
        size="sm"
        label="Ajouter un jeu de données"
        icon="ri-add-line"
        @click.prevent="addDataset"
      />
    </div>
  </div>
  <!-- Actual datasets list -->
  <div v-if="datasetsProperties.length < 1" class="no-dataset">
    <p>Ce {{ topicsName }} ne contient pas encore de jeux de données</p>
  </div>
  <template v-else>
    <div v-if="datasetEditorialization" class="fr-mt-10v">
      <ul role="list" class="groups fr-m-0 fr-p-0">
        <li v-for="[group, datasets] in groupedDatasets" :key="group">
          <DisclosureWidget
            v-if="datasets.length"
            :group-name="group"
            :all-groups="groupedDatasets"
            :datasets-properties="datasets"
            @edit-group-name="handleRenameGroup"
            @delete-group="handleDeleteGroup"
          >
            <template #datasetActions="{ dataset, index }">
              <DsfrButton
                v-if="isEdit"
                size="sm"
                icon="ri-pencil-line"
                label="Éditer"
                tertiary
                icon-only
                @click.prevent="editDataset(dataset, index, group)"
              />
              <DsfrButton
                v-if="isEdit"
                size="sm"
                icon="ri-delete-bin-line"
                label="Supprimer"
                tertiary
                icon-only
                @click.prevent="handleRemoveDataset(group, index)"
              />
            </template>
            <template #datasetContent="{ dataset }">
              <!-- eslint-disable-next-line vue/no-v-html -->
              <div v-html="fromMarkdown(dataset.purpose)"></div>
              <BouquetDatasetCard
                v-if="dataset.id"
                :dataset-properties="dataset"
                :dataset-content="datasetsContent.get(dataset.id)"
              />
              <div class="fr-grid-row">
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
            </template>
          </DisclosureWidget>
        </li>
      </ul>
    </div>
    <div v-else>
      <div v-for="(dataset, index) in datasetsProperties" :key="index">
        <BouquetDatasetCard
          v-if="dataset.id"
          :dataset-properties="dataset"
          :dataset-content="datasetsContent.get(dataset.id)"
        />
      </div>
    </div>
  </template>

  <!-- add/edit modal -->
  <DatasetEditModal
    v-if="isEdit"
    ref="modal"
    v-model="datasetsProperties"
    v-model:groups-model="groupedDatasets"
    @submit-modal="onDatasetEditModalSubmit"
  />
</template>

<style scoped>
.groups {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
