<script setup lang="ts">
import type { DatasetV2 } from '@datagouv/components-next'
import { computed, nextTick, ref, type Ref } from 'vue'

import { useAnimationConstants } from '@/utils/constants'

const { HIGHLIGHT_DURATION, SCROLL_TIMEOUT } = useAnimationConstants()

import FactorEditModal, {
  type FactorEditModalType
} from '@/components/forms/dataset/FactorEditModal.vue'
import config from '@/config'
import type { ResolvedFactor } from '@/model/topic'
import { useTopicElementStore } from '@/store/TopicElementStore'
import { isAvailable } from '@/utils/topic'

import { useCurrentPageConf } from '@/router/utils'
import { useResourceStore } from '@/store/ResourceStore'
import { basicSlugify, fromMarkdown } from '@/utils'
import type { OgcLayerInfo } from '@/utils/ogcServices'
import { findOgcCompatibleResource } from '@/utils/ogcServices'
import { openInQgis, openTopicInQgis } from '@/utils/qgis'
import { isOnlyNoGroup, useFactorsFilter, useGroups } from '@/utils/topicGroups'
import { useTopicReferencedContent } from '@/utils/topicReferencedContent'
import DataserviceInTopicCard from './DataserviceInTopicCard.vue'
import DatasetInTopicCard from './DatasetInTopicCard.vue'
import TopicGroup from './TopicGroup.vue'
import TopicInTopicCard from './TopicInTopicCard.vue'

const factors = defineModel({
  type: Array<ResolvedFactor>,
  default: []
})

const props = defineProps({
  isEdit: {
    type: Boolean,
    default: false
  },
  topicId: {
    type: String,
    required: true
  },
  topicName: {
    type: String,
    required: false,
    default: 'Topic'
  }
})

const modal: Ref<FactorEditModalType | null> = ref(null)
const groupRefs = ref<Record<string, InstanceType<typeof TopicGroup>>>({})
const highlightedFactorId = ref<string | null>(null)

const { pageConf, pageKey } = useCurrentPageConf()
const elementStore = useTopicElementStore()
const resourceStore = useResourceStore()

const {
  getTopicForFactor,
  getDataserviceForFactor,
  getDatasetForFactor,
  loadTopicsContent,
  loadDataservicesContent,
  loadDatasetsContent
} = useTopicReferencedContent(factors, pageKey)

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

const emit = defineEmits<{
  factorChanged: []
}>()

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
  emit('factorChanged')
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

const ogcLayerInfo = ref(new Map<string, OgcLayerInfo>())

/**
 * Iterate over MAX_PAGES pages of resources for a dataset and find the best OGC service.
 * Stores result in ogcLayerInfo Map.
 * Stops if WFS is found, fallback to WMS.
 */
const computeOgcInfo = async (dataset: DatasetV2) => {
  if (!config.website.datasets.open_in_qgis) {
    return
  }
  const MAX_PAGES = 10
  let bestResult: OgcLayerInfo | null = null
  for (let page = 1; page <= MAX_PAGES; page++) {
    const response = await resourceStore.fetchDatasetResources(dataset.id, {
      page
    })
    const pageResult = findOgcCompatibleResource(response.data)
    // Update best result if we found something better
    if (pageResult?.format === 'wfs' || (!bestResult && pageResult)) {
      bestResult = pageResult
    }
    // Stop if we found WFS (best possible) or no more pages
    if (pageResult?.format === 'wfs' || !response.next_page) {
      break
    }
  }
  if (bestResult) {
    ogcLayerInfo.value.set(dataset.id, bestResult)
  }
}

/**
 * Check if any dataset in the topic has OGC-compatible resources
 */
const hasOgcResources = computed(() => {
  return ogcLayerInfo.value.size > 0
})

/**
 * Opens a given dataset from a factor in QGIS
 */
const handleOpenInQgis = async (datasetId: string, datasetTitle: string) => {
  try {
    await openInQgis(datasetId, datasetTitle, ogcLayerInfo.value)
  } catch (error) {
    console.error('Failed to open in QGIS:', error)
    alert("Une erreur est survenue lors de l'ouverture dans QGIS.")
  }
}

/**
 * Opens all OGC-compatible resources from the topic in QGIS, organized by factor groups.
 */
const handleOpenTopicInQgis = async () => {
  try {
    await openTopicInQgis(
      groupedFactors.value,
      ogcLayerInfo.value,
      (factor) => {
        const dataset = getDatasetForFactor(factor)
        return dataset ? { id: dataset.id, title: dataset.title } : null
      },
      props.topicName
    )
  } catch (error) {
    console.error('Failed to open topic in QGIS:', error)
    alert("Une erreur est survenue lors de l'ouverture dans QGIS.")
  }
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
  () =>
    factors.value
      .map((factor) => factor.element?.id || factor.siteExtras?.uri)
      .filter(Boolean),
  () => {
    loadDatasetsContent(computeOgcInfo)
    loadTopicsContent()
    loadDataservicesContent()
  },
  { immediate: true }
)

const navigateToElement = (elementId: string) => {
  const factor = factors.value.find((f) => f.id === elementId)
  if (!factor) {
    console.warn(`Trying to scroll to factor ${elementId}, not found.`)
    return
  }
  nextTick(() => {
    // open the group disclosure if needed
    if (factor.siteExtras.group) {
      const groupRef = groupRefs.value[factor.siteExtras.group]
      if (groupRef) {
        groupRef.openDisclosure()
      }
    }
    // Wait a bit for full loading, then scroll
    setTimeout(() => {
      const element = document.getElementById(`factor-${elementId}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        // Add highlight effect using reactive state
        highlightedFactorId.value = elementId
        setTimeout(() => {
          highlightedFactorId.value = null
        }, HIGHLIGHT_DURATION)
      }
    }, SCROLL_TIMEOUT)
  })
}

defineExpose({
  navigateToElement,
  hasOgcResources,
  handleOpenTopicInQgis
})
</script>

<template>
  <!-- Header and buttons -->
  <div class="flex-gap fr-grid-row fr-grid-row--middle justify-between">
    <h2 class="fr-col-auto fr-m-0">
      Composition du {{ pageConf.labels.extended }}
    </h2>
    <SearchComponent
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
    <div class="fr-mt-10v">
      <ul role="list" class="groups fr-m-0 fr-p-0">
        <template v-for="[group, groupFactors] in filteredResults" :key="group">
          <li v-if="groupFactors.length && !isGroupOnlyHidden(group)">
            <TopicGroup
              :ref="
                (el) =>
                  (groupRefs[group] = el as InstanceType<typeof TopicGroup>)
              "
              :group-name="group"
              :all-groups="filteredResults"
              :factors="groupFactors"
              :is-edit="isEdit"
              :highlighted-factor-id="highlightedFactorId"
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
                <DatasetInTopicCard
                  v-if="getDatasetForFactor(factor)"
                  :factor="factor"
                  :dataset-content="getDatasetForFactor(factor)!"
                />
                <TopicInTopicCard
                  v-else-if="getTopicForFactor(factor)"
                  :page-key="pageKey"
                  :topic="getTopicForFactor(factor)!"
                  class="fr-my-2w"
                />
                <DataserviceInTopicCard
                  v-else-if="getDataserviceForFactor(factor)"
                  :dataservice="getDataserviceForFactor(factor)!"
                  class="fr-my-2w"
                />
                <div
                  v-if="
                    !getTopicForFactor(factor) &&
                    !getDataserviceForFactor(factor)
                  "
                  class="fr-grid-row"
                >
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
                    >Accéder aux données</a
                  >
                  <DsfrButton
                    v-if="
                      factor.element?.id && ogcLayerInfo.has(factor.element.id)
                    "
                    secondary
                    size="sm"
                    icon="fr-icon-road-map-line"
                    class="test__open_dataset_in_qgis_btn"
                    @click="
                      handleOpenInQgis(
                        factor.element.id,
                        getDatasetForFactor(factor)!.title
                      )
                    "
                  >
                    Ouvrir dans QGIS (WFS/WMS)
                  </DsfrButton>
                </div>
              </template>
            </TopicGroup>
          </li>
        </template>
      </ul>
    </div>
  </template>

  <!-- add/edit modal -->
  <FactorEditModal
    v-if="isEdit"
    ref="modal"
    v-model="factors"
    v-model:groups-model="groupedFactors"
    :topic-id="props.topicId"
    @submit-modal="emit('factorChanged')"
  />
</template>

<style scoped>
.flex-gap {
  --gap: 1rem;
}
details {
  border-block: 1px solid var(--border-default-grey, #ddd);
  color: var(--text-action-high-blue-france);
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

/* Intensify contrast for topic and dataset cards badges */
:deep(.fr-badge--mention-grey) {
  background-color: #cecece;
  color: var(--text-default-grey) !important;
}
</style>
