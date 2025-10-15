<script setup lang="ts">
import { ref, type Ref } from 'vue'

import type { DatasetV2 } from '@datagouv/components-next'

import FactorEditModal, {
  type FactorEditModalType
} from '@/components/forms/dataset/FactorEditModal.vue'
import config from '@/config'
import { type ResolvedFactor } from '@/model/topic'
import { useDatasetStore } from '@/store/OrganizationDatasetStore'
import { useTopicElementStore } from '@/store/TopicElementStore'
import { toastHttpError } from '@/utils/error'
import { isNotFoundError } from '@/utils/http'
import { isAvailable } from '@/utils/topic'

import { useCurrentPageConf } from '@/router/utils'
import { basicSlugify, fromMarkdown } from '@/utils'
import { isOnlyNoGroup, useFactorsFilter, useGroups } from '@/utils/topicGroups'
import TopicDatasetCard from './TopicDatasetCard.vue'
import TopicGroup from './TopicGroup.vue'

const factors = defineModel({
  type: Array<ResolvedFactor>,
  default: []
})

const props = defineProps({
  isEdit: {
    type: Boolean,
    default: false
  },
  datasetEditorialization: {
    type: Boolean,
    default: true
  },
  topicId: {
    type: String,
    required: true
  }
})

const modal: Ref<FactorEditModalType | null> = ref(null)
const datasetsContent = ref(new Map<string, DatasetV2>())

const { pageConf } = useCurrentPageConf()
const elementStore = useTopicElementStore()

const {
  groupedFactors,
  getFactorIndex,
  removeFactorFromGroup,
  renameGroup,
  deleteGroup
} = useGroups(factors)

const {
  isFiltering,
  filterFactors,
  filteredFactors,
  isAllGroupsHidden,
  isGroupOnlyHidden
} = useFactorsFilter(factors)

const { groupedFactors: filteredResults } = useGroups(filteredFactors)

const handleRemoveFactor = async (group: string, index: number) => {
  const confirmMessage =
    'Etes-vous sûr de vouloir supprimer ce jeu de données ?'
  if (!window.confirm(confirmMessage)) {
    return
  }
  const result = removeFactorFromGroup(group, index)
  if (!result.deletedFactor) {
    return
  }
  if (result.deletedFactor.id) {
    await elementStore.deleteElement(props.topicId, result.deletedFactor.id)
  }
  factors.value = result.factors
}

const handleRenameGroup = async (
  oldGroupName: string,
  newGroupName: string
) => {
  // Update local state and get the list of changed factors
  const { factors: updatedFactors, changedFactors } = renameGroup(
    oldGroupName,
    newGroupName
  )
  factors.value = updatedFactors

  // Persist changes to API only for the factors that were actually modified
  const updatePromises = changedFactors.map(async (factor) => {
    if (factor.id) {
      return elementStore.updateElement(
        props.topicId,
        factor.id,
        factor.unresolved()
      )
    }
  })

  await Promise.all(updatePromises)
}

const handleDeleteGroup = async (groupName: string) => {
  // Update local state and get the list of deleted factors
  const { factors: updatedFactors, deletedFactors } = deleteGroup(groupName)
  factors.value = updatedFactors

  // Delete the factors via API
  const deletePromises = deletedFactors.map(async (factor) => {
    if (factor.id) {
      return elementStore.deleteElement(props.topicId, factor.id)
    }
  })

  await Promise.all(deletePromises)
}

const loadDatasetsContent = () => {
  factors.value.forEach((factor) => {
    const id = factor.element?.id ?? null
    if (id && !datasetsContent.value.has(id) && !factor.remoteDeleted) {
      useDatasetStore()
        .load(id, { toasted: false })
        .then((d) => {
          if (d) {
            datasetsContent.value.set(id, d)
            factor.remoteArchived = !!d.archived
          }
        })
        .catch((err) => {
          if (isNotFoundError(err)) {
            factor.remoteDeleted = true
          } else {
            toastHttpError(err)
          }
        })
    }
  })
}

const showTOC = computed(() => {
  /*
  hide the table of content if "NoGroup" is the only group and results are not 0
  or
  hide if all factors are hidden by the filter
  */
  return (
    (!isOnlyNoGroup(filteredResults.value) && !!filteredResults.value.size) ||
    !isAllGroupsHidden
  )
})

const addDataset = () => {
  modal.value?.addFactor()
}

const editFactor = (factor: ResolvedFactor, index: number, group: string) => {
  modal.value?.editFactor(factor, getFactorIndex(group, index))
}

watch(
  () => factors.value.map((factor) => factor.element?.id).filter(Boolean),
  () => {
    loadDatasetsContent()
  },
  { immediate: true }
)
</script>

<template>
  <!-- Header and buttons -->
  <div class="flex-gap fr-grid-row fr-grid-row--middle justify-between">
    <h2 class="fr-col-auto fr-m-0">
      Composition du {{ pageConf.labels.extended }}
    </h2>
    <SearchComponent
      v-if="datasetEditorialization"
      id="filter-factors"
      :is-filter="true"
      search-label="Filtrer les données"
      :label-visible="false"
      @update:model-value="filterFactors"
    />
    <div class="fr-col-auto fr-grid-row fr-grid-row--middle">
      <DsfrButton
        v-if="isEdit"
        size="sm"
        label="Ajouter un jeu de données"
        icon="fr-icon-add-line"
        class="test__add_dataset_btn"
        @click.prevent="addDataset"
      />
    </div>
  </div>
  <!-- Datasets list -->
  <div
    v-if="filteredResults.size < 1 || isAllGroupsHidden"
    class="no-dataset fr-mt-2w"
  >
    <p v-if="isFiltering">Aucune donnée trouvée pour cette recherche.</p>
    <p v-else>
      Ce {{ pageConf.labels.singular }} ne contient pas encore de donnée.
    </p>
  </div>
  <template v-else>
    <details v-if="showTOC" class="fr-mt-2w">
      <summary class="fr-py-3v fr-px-2w">Sommaire</summary>
      <ul role="list">
        <li
          v-for="[group] in filteredResults"
          v-show="!isGroupOnlyHidden(group)"
          :key="group"
        >
          <a :href="`#${basicSlugify(group)}-summary`">{{ group }}</a>
        </li>
      </ul>
    </details>
    <div v-if="datasetEditorialization" class="fr-mt-10v">
      <ul role="list" class="groups fr-m-0 fr-p-0">
        <template v-for="[group, groupFactors] in filteredResults" :key="group">
          <li v-if="groupFactors.length && !isGroupOnlyHidden(group)">
            <TopicGroup
              :group-name="group"
              :all-groups="filteredResults"
              :factors="groupFactors"
              :is-edit="isEdit"
              @edit-group-name="handleRenameGroup"
              @delete-group="handleDeleteGroup"
            >
              <template v-if="isEdit" #factorActions="{ factor, index }">
                <DsfrButton
                  size="sm"
                  icon="fr-icon-edit-line"
                  label="Éditer"
                  tertiary
                  icon-only
                  :on-click="() => editFactor(factor, index, group)"
                  class="test__edit_factor_btn"
                />
                <DsfrButton
                  size="sm"
                  icon="fr-icon-delete-line"
                  label="Supprimer"
                  tertiary
                  icon-only
                  :on-click="() => handleRemoveFactor(group, index)"
                  class="test__delete_factor_btn"
                />
              </template>
              <template #factorContent="{ factor }">
                <!-- eslint-disable-next-line vue/no-v-html -->
                <div v-html="fromMarkdown(factor.description)"></div>
                <TopicDatasetCard
                  v-if="factor.element?.id"
                  :factor="factor"
                  :dataset-content="datasetsContent.get(factor.element.id)"
                />
                <div class="fr-grid-row">
                  <a
                    v-if="
                      !isAvailable(factor.siteExtras.availability) && !isEdit
                    "
                    class="fr-btn fr-btn--sm fr-btn--secondary inline-flex"
                    :href="`mailto:${config.website.contact_email}`"
                  >
                    Aidez-nous à trouver la donnée</a
                  >
                  <a
                    v-if="factor.siteExtras.uri && !factor.element?.id"
                    class="fr-btn fr-btn--sm fr-btn--secondary inline-flex"
                    :href="factor.siteExtras.uri as string"
                    target="_blank"
                    >Accéder au catalogue</a
                  >
                </div>
              </template>
            </TopicGroup>
          </li>
        </template>
      </ul>
    </div>
    <div v-else>
      <div v-for="(factor, index) in factors" :key="index">
        <TopicDatasetCard
          v-if="factor.element?.id"
          :factor="factor"
          :dataset-content="datasetsContent.get(factor.element.id)"
        />
      </div>
    </div>
  </template>

  <!-- add/edit modal -->
  <FactorEditModal
    v-if="isEdit"
    ref="modal"
    v-model="factors"
    v-model:groups-model="groupedFactors"
    :dataset-editorialization
    :topic-id="props.topicId"
  />
</template>

<style scoped>
.flex-gap {
  --gap: 1rem;
}
details {
  border-block: 1px solid var(--border-default-grey, #ddd);
  color: #000091;
}
details[open] {
  padding-block-end: 0.75rem;
}
summary {
  font-weight: 500;
  background-color: var(--background-alt-grey, #f6f6f6);
}
details li {
  margin-block-start: 1rem;
}
details summary::marker,
:is(::-webkit-details-marker) {
  content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' viewBox='0 0 16 16' aria-hidden='true' transform='rotate(90)' %3E%3Cpath fill='%233458A2' fill-rule='evenodd' d='m8 7.219-3.3 3.3-.942-.943L8 5.333l4.243 4.243-.943.943-3.3-3.3Z' clip-rule='evenodd' /%3E%3C/svg%3E")
    ' ';
}
details[open] summary::marker {
  content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' viewBox='0 0 16 16' aria-hidden='true' transform='rotate(180)' %3E%3Cpath fill='%233458A2' fill-rule='evenodd' d='m8 7.219-3.3 3.3-.942-.943L8 5.333l4.243 4.243-.943.943-3.3-3.3Z' clip-rule='evenodd' /%3E%3C/svg%3E")
    ' ';
}
.groups {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
:deep(search) {
  margin-inline-start: auto;
}
</style>
