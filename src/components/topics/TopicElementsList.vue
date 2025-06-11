<script setup lang="ts">
import { ref, type Ref } from 'vue'

import type { DatasetV2 } from '@datagouv/components'

import ElementEditModal, {
  type ElementEditModalType
} from '@/components/forms/dataset/ElementEditModal.vue'
import config from '@/config'
import { type DatasetElement } from '@/model/topic'
import { useDatasetStore } from '@/store/OrganizationDatasetStore'
import { toastHttpError } from '@/utils/error'
import { isNotFoundError } from '@/utils/http'
import { isAvailable } from '@/utils/topic'

import { useCurrentPageConf } from '@/router/utils'
import { basicSlugify, fromMarkdown } from '@/utils'
import { useSiteId } from '@/utils/config'
import {
  isOnlyNoGroup,
  useElementsFilter,
  useGroups
} from '@/utils/topicGroups'
import TopicDatasetCard from './TopicDatasetCard.vue'
import TopicGroup from './TopicGroup.vue'

const elements = defineModel({
  type: Array<DatasetElement>,
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

const emits = defineEmits(['updateElements'])

const modal: Ref<ElementEditModalType | null> = ref(null)
const datasetsContent = ref(new Map<string, DatasetV2>())

const { pageConf } = useCurrentPageConf()

const {
  groupedElements,
  getElementIndex,
  removeElementFromGroup,
  renameGroup,
  deleteGroup
} = useGroups(elements)

const {
  isFiltering,
  filterElements,
  filteredElements,
  isAllGroupsHidden,
  isGroupOnlyHidden
} = useElementsFilter(elements)

const { groupedElements: filteredResults } = useGroups(filteredElements)

const handleRemoveDataset = (group: string, index: number) => {
  elements.value = removeElementFromGroup(group, index)
  emits('updateElements')
}

const handleRenameGroup = (oldGroupName: string, newGroupName: string) => {
  elements.value = renameGroup(oldGroupName, newGroupName)
  emits('updateElements')
}

const handleDeleteGroup = (groupName: string) => {
  elements.value = deleteGroup(groupName)
  emits('updateElements')
}

const loadDatasetsContent = () => {
  elements.value.forEach((element) => {
    const id = element.element?.id ?? null
    if (id && !datasetsContent.value.has(id) && !element.remoteDeleted) {
      useDatasetStore()
        .load(id, { toasted: false })
        .then((d) => {
          if (d) {
            datasetsContent.value.set(id, d)
            element.remoteArchived = !!d.archived
          }
        })
        .catch((err) => {
          if (isNotFoundError(err)) {
            element.remoteDeleted = true
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
  hide if all factors (datasetProperties) are hidden by the filter
  */
  return (
    (!isOnlyNoGroup(filteredResults.value) && !!filteredResults.value.size) ||
    !isAllGroupsHidden
  )
})

const addDataset = () => {
  modal.value?.addElement()
}

const editDataset = (element: DatasetElement, index: number, group: string) => {
  modal.value?.editElement(element, getElementIndex(group, index))
}

const onElementEditModalSubmit = () => {
  emits('updateElements')
}

watch(
  () => elements.value.map((element) => element.element?.id).filter(Boolean),
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
      @update:model-value="filterElements"
    />
    <div class="fr-col-auto fr-grid-row fr-grid-row--middle">
      <DsfrButton
        v-if="isEdit"
        size="sm"
        label="Ajouter un jeu de données"
        icon="fr-icon-add-line"
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
        <template
          v-for="[group, groupElements] in filteredResults"
          :key="group"
        >
          <li v-if="groupElements.length && !isGroupOnlyHidden(group)">
            <TopicGroup
              :group-name="group"
              :all-groups="filteredResults"
              :elements="groupElements"
              :is-edit="isEdit"
              @edit-group-name="handleRenameGroup"
              @delete-group="handleDeleteGroup"
            >
              <template v-if="isEdit" #elementActions="{ element, index }">
                <DsfrButton
                  size="sm"
                  icon="fr-icon-edit-line"
                  label="Éditer"
                  tertiary
                  icon-only
                  :on-click="() => editDataset(element, index, group)"
                />
                <DsfrButton
                  size="sm"
                  icon="fr-icon-delete-line"
                  label="Supprimer"
                  tertiary
                  icon-only
                  :on-click="() => handleRemoveDataset(group, index)"
                />
              </template>
              <template #elementContent="{ element }">
                <!-- eslint-disable-next-line vue/no-v-html -->
                <div v-html="fromMarkdown(element.description)"></div>
                <TopicDatasetCard
                  v-if="element.element?.id"
                  :element="element"
                  :dataset-content="datasetsContent.get(element.element.id)"
                />
                <div class="fr-grid-row">
                  <a
                    v-if="
                      !isAvailable(element.extras[useSiteId()]?.availability) &&
                      !isEdit
                    "
                    class="fr-btn fr-btn--sm fr-btn--secondary inline-flex"
                    :href="`mailto:${config.website.contact_email}`"
                  >
                    Aidez-nous à trouver la donnée</a
                  >
                  <a
                    v-if="
                      element.extras[useSiteId()]?.uri && !element.element?.id
                    "
                    class="fr-btn fr-btn--sm fr-btn--secondary inline-flex"
                    :href="element.extras[useSiteId()]?.uri as string"
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
      <div v-for="(element, index) in elements" :key="index">
        <TopicDatasetCard
          v-if="element.element?.id"
          :element="element"
          :dataset-content="datasetsContent.get(element.element.id)"
        />
      </div>
    </div>
  </template>

  <!-- add/edit modal -->
  <ElementEditModal
    v-if="isEdit"
    ref="modal"
    v-model="elements"
    v-model:groups-model="groupedElements"
    :dataset-editorialization
    @submit-modal="onElementEditModalSubmit"
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
