<script setup lang="ts">
import {
  AnimatedLoader,
  DatasetInformationPanel,
  ReadMore,
  SimpleBanner
} from '@datagouv/components-next'
import { computed, inject, onMounted, ref } from 'vue'

import DiscussionsList from '@/components/DiscussionsList.vue'
import GenericContainer from '@/components/GenericContainer.vue'
import DatasetAddToTopicModal from '@/components/datasets/DatasetAddToTopicModal.vue'
import DatasetDataservicesList from '@/components/datasets/DatasetDataservicesList.vue'
import DatasetReusesList from '@/components/datasets/DatasetReusesList.vue'
import DatasetSidebar from '@/components/datasets/DatasetSidebar.vue'
import ExtendedInformationPanel from '@/components/datasets/ExtendedInformationPanel.vue'
import ResourcesList from '@/components/datasets/ResourcesList.vue'
import config from '@/config'
import {
  AccessibilityPropertiesKey,
  type AccessibilityPropertiesType
} from '@/model/injectionKeys'
import { useCurrentPageConf, useRouteParamsAsString } from '@/router/utils'
import { useDatasetStore } from '@/store/OrganizationDatasetStore'
import { useUserStore } from '@/store/UserStore'
import { descriptionFromMarkdown } from '@/utils'
import { useDatasetsConf, usePageConf } from '@/utils/config'

const route = useRouteParamsAsString()
const datasetId = route.params.item_id

const datasetStore = useDatasetStore()
const userStore = useUserStore()

const { pageKey, pageConf } = useCurrentPageConf()
const showDiscussions = pageConf.resources_tabs.discussions.display

const datasetsConf = useDatasetsConf()
const topicPageKey = datasetsConf.add_to_topic?.page
const topicPageConf = topicPageKey ? usePageConf(topicPageKey) : null

const canEdit = computed(() => {
  return pageConf.editable && userStore.hasEditPermissions(dataset.value)
})
const canAddToTopic = computed(() => {
  return (
    topicPageConf &&
    topicPageKey &&
    userStore.loggedIn &&
    userStore.canAddTopic(topicPageKey)
  )
})

const dataset = computed(() => datasetStore.get(datasetId))

const showAddToTopicModal = ref(false)

const setAccessibilityProperties = inject(
  AccessibilityPropertiesKey
) as AccessibilityPropertiesType

const links = computed(() => {
  const breadcrumbs = [{ to: '/', text: 'Accueil' }]
  breadcrumbs.push({
    to: pageConf.list_all === true ? `/${pageKey || 'datasets'}` : '',
    text: pageConf.breadcrumb_title || pageConf.title
  })
  breadcrumbs.push({ to: '', text: dataset.value?.title ?? '' })
  return breadcrumbs
})

const tabTitles = [
  { title: 'Fichiers', tabId: 'tab-0', panelId: 'tab-content-0' },
  { title: 'Réutilisations et API', tabId: 'tab-1', panelId: 'tab-content-1' },
  { title: 'Discussions', tabId: 'tab-2', panelId: 'tab-content-2' },
  { title: 'Informations', tabId: 'tab-3', panelId: 'tab-content-3' }
]

const activeTab = ref(0)

const description = computed(() => descriptionFromMarkdown(dataset))

const discussionWellTitle = showDiscussions
  ? 'Participer aux discussions'
  : 'Voir les discussions'
const discussionWellDescription = showDiscussions
  ? 'Vous avez une question sur ce jeu de données ? Rendez-vous sur data.gouv.fr pour participer aux discussions.'
  : 'Vous avez une question sur ce jeu de données ? Rendez-vous sur data.gouv.fr pour voir les discussions.'

const openDataGouvDiscussions = () =>
  window.open(`${dataset.value?.page}#/discussions`, 'datagouv-discussion')

const goToEdit = () => {
  if (!dataset.value) return
  window.location.href = `${config.datagouvfr.base_url}/admin/datasets/${dataset.value.id}/`
}

onMounted(() => {
  datasetStore
    .load(datasetId, { toasted: false, redirectNotFound: true })
    .then(() => {
      setAccessibilityProperties(dataset.value?.title)
    })
})
</script>

<template>
  <div class="fr-container">
    <DsfrBreadcrumb class="fr-mb-1v" :links="links" />
  </div>
  <GenericContainer v-if="dataset" class="tabs-height-fix">
    <div class="fr-grid-row fr-grid-row--gutters">
      <div class="fr-col-12 fr-col-md-8">
        <h1 class="fr-mb-2v">{{ dataset.title }}</h1>
        <ReadMore max-height="600">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-html="description"></div>
        </ReadMore>
      </div>
      <DatasetSidebar :dataset="dataset">
        <template #bottom>
          <div
            v-if="canEdit || canAddToTopic"
            class="fr-mt-2w fr-col-auto fr-grid-row fr-grid-row--middle flex-gap"
          >
            <DsfrButton
              v-if="canEdit"
              secondary
              size="md"
              label="Éditer"
              icon="fr-icon-pencil-line"
              @click="goToEdit"
            />
            <!-- add dataset to topic (if enabled) -->
            <template v-if="canAddToTopic && topicPageConf">
              <DsfrButton
                size="md"
                :label="`Ajouter à un ${topicPageConf.labels.singular}`"
                icon="fr-icon-file-add-line"
                @click="showAddToTopicModal = true"
              />
              <DatasetAddToTopicModal
                v-if="showAddToTopicModal"
                v-model:show="showAddToTopicModal"
                :topic-page-key="datasetsConf.add_to_topic?.page || 'topics'"
                :dataset="dataset"
              />
            </template>
          </div>
        </template>
      </DatasetSidebar>
    </div>

    <DsfrTabs
      v-model="activeTab"
      class="fr-mt-2w"
      tab-list-name="Groupes d'attributs du jeu de données"
      :tab-titles="tabTitles"
    >
      <!-- Fichiers -->
      <DsfrTabContent panel-id="tab-content-0" tab-id="tab-0">
        <ResourcesList :dataset="dataset" />
      </DsfrTabContent>

      <!-- Réutilisations et API -->
      <DsfrTabContent panel-id="tab-content-1" tab-id="tab-1">
        <DatasetDataservicesList :dataset-id="dataset.id" />
        <DatasetReusesList :dataset-id="dataset.id" />
      </DsfrTabContent>

      <!-- Discussions -->
      <DsfrTabContent panel-id="tab-content-2" tab-id="tab-2">
        <SimpleBanner
          v-if="!pageConf.resources_tabs.discussions.create"
          type="primary"
        >
          <div class="fr-grid-row fr-grid-row--gutters fr-grid-row--middle">
            <div class="fr-col-12 fr-col-lg-8">
              <p class="fr-text--bold fr-mb-0">{{ discussionWellTitle }}</p>
              <p class="fr-text--alt fr-text--sm f-italic fr-m-0">
                {{ discussionWellDescription }}
              </p>
            </div>
            <div class="fr-col-12 fr-col-lg-4 text-align-right">
              <DsfrButton
                label="Voir les discussions sur data.gouv.fr"
                icon="fr-icon-external-link-line"
                size="sm"
                :icon-right="true"
                @click="openDataGouvDiscussions"
              />
            </div>
          </div>
        </SimpleBanner>
        <DiscussionsList v-if="showDiscussions" :subject="dataset" />
      </DsfrTabContent>

      <!-- Informations -->
      <DsfrTabContent panel-id="tab-content-3" tab-id="tab-3">
        <ExtendedInformationPanel
          v-if="
            config.website.datasets.show_extended_information_panel && dataset
          "
          :dataset="dataset"
        />
        <Suspense>
          <DatasetInformationPanel :dataset="dataset" />
          <template #fallback>
            <AnimatedLoader />
          </template>
        </Suspense>
      </DsfrTabContent>
    </DsfrTabs>
  </GenericContainer>
</template>
