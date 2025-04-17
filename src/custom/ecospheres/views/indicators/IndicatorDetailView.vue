<script setup lang="ts">
import { InformationPanel, ReadMore } from '@datagouv/components'
import { computed, inject, onMounted, ref } from 'vue'

import DiscussionsList from '@/components/DiscussionsList.vue'
import GenericContainer from '@/components/GenericContainer.vue'
import ReusesList from '@/components/ReusesList.vue'
import DatasetAddToBouquetModal from '@/components/datasets/DatasetAddToBouquetModal.vue'
import ResourcesList from '@/components/datasets/ResourcesList.vue'
import {
  AccessibilityPropertiesKey,
  type AccessibilityPropertiesType
} from '@/model/injectionKeys'
import { useRouteParamsAsString } from '@/router/utils'
import { useDatasetStore } from '@/store/OrganizationDatasetStore'
import { useUserStore } from '@/store/UserStore'
import { descriptionFromMarkdown } from '@/utils'
import { useLicense } from '@/utils/dataset'
import { useSpatialGranularity } from '@/utils/spatial'
import IndicatorAPIDocumentation from '../../components/indicators/IndicatorAPIDocumentation.vue'
import IndicatorInformationPanel from '../../components/indicators/IndicatorInformationPanel.vue'
import IndicatorSourcesList from '../../components/indicators/IndicatorSourcesList.vue'
import IndicatorTags from '../../components/indicators/IndicatorTags.vue'
import type { Indicator } from '../../model/indicator'
import { UNFILLED_LABEL, useIndicatorExtras } from '../../utils/indicator'

const route = useRouteParamsAsString()
const indicatorId = route.params.iid

const datasetStore = useDatasetStore()
const userStore = useUserStore()

const indicator = computed(
  () => datasetStore.get(indicatorId) as Indicator | undefined
)
const { unite, api } = useIndicatorExtras(indicator)

const showAddToBouquetModal = ref(false)

const setAccessibilityProperties = inject(
  AccessibilityPropertiesKey
) as AccessibilityPropertiesType

const links = computed(() => [
  { to: '/', text: 'Accueil' },
  { to: '/indicators', text: 'Indicateurs' },
  { text: indicator.value?.title || '' }
])

const tabTitles = [
  { title: 'Informations', tabId: 'tab-info', panelId: 'tab-content-info' },
  {
    title: 'Fichiers et API',
    tabId: 'tab-files',
    panelId: 'tab-content-files'
  },
  {
    title: 'Réutilisations',
    tabId: 'tab-reuses',
    panelId: 'tab-content-reuses'
  },
  {
    title: 'Discussions',
    tabId: 'tab-discussions',
    panelId: 'tab-content-discussions'
  },
  { title: 'Sources', tabId: 'tab-sources', panelId: 'tab-content-sources' },
  {
    title: 'Détails techniques',
    tabId: 'tab-details',
    panelId: 'tab-content-details'
  }
]

const activeTab = ref(0)

const description = computed(() => descriptionFromMarkdown(indicator))
const license = useLicense(indicator)
const spatialGranularity = useSpatialGranularity(indicator)

const dataVizUrl: Ref<string | null> = ref(null)
watch(
  () => api.value?.id,
  (iid) => {
    if (!iid) return null
    const cleanId = iid.replace('id_', '')
    // FIXME: this is a temporary access list for indicators with a viz available
    // we should either have a dataviz for every indicator OR enable CORS on the dataviz server to test dynamically
    const availableIds = [
      '26',
      '606',
      '81',
      '832',
      '131',
      '42',
      '839',
      '421',
      '914',
      '638',
      '499',
      '407',
      '948',
      '947',
      '331',
      '804',
      '897'
    ]
    if (availableIds.includes(cleanId)) {
      dataVizUrl.value = `https://region-beta.indicateurs.ecologie.gouv.fr/embed/${cleanId}/`
      // insert at third position
      tabTitles.splice(2, 0, {
        title: 'Visualisation',
        tabId: 'tab-dataviz',
        panelId: 'tab-content-dataviz'
      })
    }
  },
  { immediate: true }
)

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
  <GenericContainer v-if="indicator">
    <div class="fr-grid-row fr-grid-row--gutters">
      <div class="fr-col-12 fr-col-md-8">
        <h1 class="fr-mb-2v">{{ indicator.title }}</h1>
        <ReadMore max-height="600">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-html="description"></div>
        </ReadMore>
      </div>
      <div class="fr-col-12 fr-col-md-4 fr-mb-4w">
        <h2 class="subtitle fr-mt-3v fr-mb-1v">Thématique</h2>
        <IndicatorTags :indicator="indicator" type="theme" />
        <h2 class="subtitle fr-mt-3v fr-mb-1v">Levier</h2>
        <IndicatorTags :indicator="indicator" type="levier" />
        <h2 class="subtitle fr-mt-3v fr-mb-1v">Maille minimale</h2>
        <p>{{ spatialGranularity?.name || UNFILLED_LABEL }}</p>
        <h2 class="subtitle fr-mt-3v fr-mb-1v">Unité</h2>
        <p>{{ unite || UNFILLED_LABEL }}</p>
        <div v-if="userStore.loggedIn">
          <DsfrButton
            class="fr-mt-2w"
            size="md"
            label="Ajouter à un bouquet"
            icon="fr-icon-file-add-line"
            @click="showAddToBouquetModal = true"
          />
          <DatasetAddToBouquetModal
            v-if="showAddToBouquetModal"
            v-model:show="showAddToBouquetModal"
            :dataset="indicator"
          />
        </div>
      </div>
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
        <IndicatorAPIDocumentation :indicator="indicator" />
      </DsfrTabContent>

      <!-- Visualisation -->
      <DsfrTabContent
        v-if="dataVizUrl"
        panel-id="tab-content-dataviz"
        tab-id="tab-dataviz"
      >
        <iframe width="100%" height="500px" :src="dataVizUrl"></iframe>
      </DsfrTabContent>

      <!-- Réutilisations -->
      <DsfrTabContent panel-id="tab-content-reuses" tab-id="tab-reuses">
        <ReusesList model="dataset" :object-id="indicator.id" />
      </DsfrTabContent>

      <!-- Discussions -->
      <DsfrTabContent
        panel-id="tab-content-discussions"
        tab-id="tab-discussions"
      >
        <DiscussionsList :subject="indicator" subject-class="Indicator" />
      </DsfrTabContent>

      <!-- Sources -->
      <DsfrTabContent panel-id="tab-content-sources" tab-id="tab-sources">
        <IndicatorSourcesList :indicator="indicator" />
      </DsfrTabContent>

      <!-- Détails techniques -->
      <DsfrTabContent panel-id="tab-content-details" tab-id="tab-details">
        <InformationPanel
          v-if="license"
          :dataset="indicator"
          :license="license"
        />
      </DsfrTabContent>
    </DsfrTabs>
  </GenericContainer>
</template>

<style scoped>
:deep(.subtitle) {
  font-size: 1rem;
}
</style>
