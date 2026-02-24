<script setup lang="ts">
import {
  AnimatedLoader,
  DatasetInformationPanel,
  ReadMore
} from '@datagouv/components-next'
import { useHead } from '@unhead/vue'
import { computed, inject, onMounted, ref } from 'vue'

import DiscussionsList from '@/components/DiscussionsList.vue'
import GenericContainer from '@/components/GenericContainer.vue'
import DatasetAddToTopicModal from '@/components/datasets/DatasetAddToTopicModal.vue'
import DatasetDataservicesList from '@/components/datasets/DatasetDataservicesList.vue'
import DatasetReusesList from '@/components/datasets/DatasetReusesList.vue'
import DatasetSidebar from '@/components/datasets/DatasetSidebar.vue'
import ResourcesList from '@/components/datasets/ResourcesList.vue'
import config from '@/config'
import IndicatorVisualisation from '@/custom/ecospheres/views/indicators/IndicatorVisualisation.vue'
import {
  AccessibilityPropertiesKey,
  type AccessibilityPropertiesType
} from '@/model/injectionKeys'
import { useRouteParamsAsString } from '@/router/utils'
import { useDatasetStore } from '@/store/OrganizationDatasetStore'
import { useUserStore } from '@/store/UserStore'
import { descriptionFromMarkdown } from '@/utils'
import IndicatorInformationPanel from '../../components/indicators/IndicatorInformationPanel.vue'
import IndicatorSourcesList from '../../components/indicators/IndicatorSourcesList.vue'
import type { Indicator } from '../../model/indicator'

const route = useRouteParamsAsString()
const indicatorId = route.params.item_id

const datasetStore = useDatasetStore()
const userStore = useUserStore()

const indicator = computed(() => datasetStore.get(indicatorId) as Indicator)

const tabularApiUrl = config.datagouvfr?.tabular_api_url

const showAddToBouquetModal = ref(false)

const setAccessibilityProperties = inject(
  AccessibilityPropertiesKey
) as AccessibilityPropertiesType

const links = computed(() => [
  { to: '/', text: 'Accueil' },
  { to: '/indicators', text: 'Indicateurs' },
  { text: indicator.value?.title || '' }
])

const tabTitles = computed(() => [
  { title: 'Informations', tabId: 'tab-info', panelId: 'tab-content-info' },
  {
    title: 'Fichiers',
    tabId: 'tab-files',
    panelId: 'tab-content-files'
  },
  // only display the visualization tab if the indicator has visualization enabled
  ...(indicator.value?.extras['ecospheres-indicateurs'].enable_visualization
    ? [
        {
          title: 'Prévisualisation',
          tabId: 'tab-viz',
          panelId: 'tab-content-viz'
        }
      ]
    : []),
  { title: 'Sources', tabId: 'tab-sources', panelId: 'tab-content-sources' },
  {
    title: 'Réutilisations et API',
    tabId: 'tab-reuses',
    panelId: 'tab-content-reuses'
  },
  {
    title: 'Discussions',
    tabId: 'tab-discussions',
    panelId: 'tab-content-discussions'
  },
  {
    title: 'Détails techniques',
    tabId: 'tab-details',
    panelId: 'tab-content-details'
  }
])

const activeTab = ref(0)

const description = computed(() => descriptionFromMarkdown(indicator))

const metaDescription = (): string | undefined => {
  return indicator.value?.description ?? ''
}

const metaTitle = computed(() => {
  return indicator.value?.title
})

useHead({
  meta: [
    {
      property: 'og:title',
      content: () => `${metaTitle.value} | ${config.website.title}`
    },
    { name: 'description', content: metaDescription },
    { property: 'og:description', content: metaDescription }
  ]
})

onMounted(() => {
  datasetStore
    .load(indicatorId, { toasted: false, redirectNotFound: true })
    .then(() => {
      setAccessibilityProperties(indicator.value?.title)
    })
})
</script>

<template>
  <div class="fr-container">
    <DsfrBreadcrumb class="fr-mb-1v" :links="links" />
  </div>
  <GenericContainer v-if="indicator" class="tabs-height-fix">
    <div class="fr-grid-row fr-grid-row--gutters">
      <div class="fr-col-12 fr-col-md-8">
        <h1 class="fr-mb-2v">{{ indicator.title }}</h1>
        <ReadMore max-height="600">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-html="description"></div>
        </ReadMore>
      </div>
      <DatasetSidebar :dataset="indicator">
        <template #bottom>
          <div v-if="userStore.loggedIn">
            <DsfrButton
              class="fr-mt-2w"
              size="md"
              label="Ajouter à un bouquet"
              icon="fr-icon-file-add-line"
              @click="showAddToBouquetModal = true"
            />
            <DatasetAddToTopicModal
              v-if="showAddToBouquetModal"
              v-model:show="showAddToBouquetModal"
              topic-page-key="bouquets"
              :dataset="indicator"
            />
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
      <!-- Informations -->
      <DsfrTabContent panel-id="tab-content-info" tab-id="tab-info">
        <IndicatorInformationPanel :indicator="indicator" />
      </DsfrTabContent>

      <!-- Fichiers -->
      <DsfrTabContent panel-id="tab-content-files" tab-id="tab-files">
        <ResourcesList
          :dataset="indicator"
          no-file-message="Il n'y a pas encore de fichier pour cet indicateur."
        />
      </DsfrTabContent>

      <!-- Prévisualisation -->
      <DsfrTabContent panel-id="tab-content-viz" tab-id="tab-viz">
        <IndicatorVisualisation
          v-if="tabularApiUrl"
          :indicator="indicator"
          :tabular-api-url="tabularApiUrl"
        />
      </DsfrTabContent>

      <!-- Réutilisations et API -->
      <DsfrTabContent panel-id="tab-content-reuses" tab-id="tab-reuses">
        <DatasetDataservicesList
          :dataset-id="indicator.id"
          empty-message="Il n'y a pas encore d'API pour cet indicateur."
        />
        <DatasetReusesList
          :dataset-id="indicator.id"
          empty-message="Il n'y a pas encore de réutilisation pour cet indicateur."
        />
      </DsfrTabContent>

      <!-- Discussions -->
      <DsfrTabContent
        panel-id="tab-content-discussions"
        tab-id="tab-discussions"
      >
        <DiscussionsList
          :subject="indicator"
          subject-class="Dataset"
          empty-message="Il n'y a pas encore de discussion pour cet indicateur."
        />
      </DsfrTabContent>

      <!-- Sources -->
      <DsfrTabContent panel-id="tab-content-sources" tab-id="tab-sources">
        <IndicatorSourcesList :indicator="indicator" />
      </DsfrTabContent>

      <!-- Détails techniques -->
      <DsfrTabContent panel-id="tab-content-details" tab-id="tab-details">
        <!-- Suspense component (experimental) is required here because `DatasetInformationPanel`
           is a component with an async setup(). If Suspense is removed from vue, `DatasetInformationPanel` must be
          updated to handle its own loading state. -->
        <Suspense>
          <DatasetInformationPanel :dataset="indicator" />
          <template #fallback>
            <AnimatedLoader />
          </template>
        </Suspense>
      </DsfrTabContent>
    </DsfrTabs>
  </GenericContainer>
</template>

<style scoped>
:deep(.subtitle) {
  font-size: 1rem;
}
/* override previous rule for sidebar */
:deep(.dataset-sidebar .subtitle) {
  font-size: 0.875rem;
}
</style>
