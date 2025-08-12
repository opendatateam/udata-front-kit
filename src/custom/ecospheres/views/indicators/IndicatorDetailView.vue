<script setup lang="ts">
import {
  AnimatedLoader,
  DatasetInformationPanel,
  ReadMore
} from '@datagouv/components-next'
import { computed, inject, onMounted, ref } from 'vue'

import DiscussionsList from '@/components/DiscussionsList.vue'
import GenericContainer from '@/components/GenericContainer.vue'
import ReusesList from '@/components/ReusesList.vue'
import DatasetAddToTopicModal from '@/components/datasets/DatasetAddToTopicModal.vue'
import ResourcesList from '@/components/datasets/ResourcesList.vue'
import {
  AccessibilityPropertiesKey,
  type AccessibilityPropertiesType
} from '@/model/injectionKeys'
import { useRouteParamsAsString } from '@/router/utils'
import { useDatasetStore } from '@/store/OrganizationDatasetStore'
import { useUserStore } from '@/store/UserStore'
import { descriptionFromMarkdown } from '@/utils'
import { useSpatialGranularity } from '@/utils/spatial'
import IndicatorAPIDocumentation from '../../components/indicators/IndicatorAPIDocumentation.vue'
import IndicatorInformationPanel from '../../components/indicators/IndicatorInformationPanel.vue'
import IndicatorSourcesList from '../../components/indicators/IndicatorSourcesList.vue'
import IndicatorTags from '../../components/indicators/IndicatorTags.vue'
import type { Indicator } from '../../model/indicator'
import { UNFILLED_LABEL, useIndicatorExtras } from '../../utils/indicator'

const route = useRouteParamsAsString()
const indicatorId = route.params.item_id

const datasetStore = useDatasetStore()
const userStore = useUserStore()

const indicator = computed(() => datasetStore.get(indicatorId) as Indicator)
const { unite } = useIndicatorExtras(indicator)

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
  { title: 'Informations', tabId: 'tab-0', panelId: 'tab-content-0' },
  { title: 'Fichiers et API', tabId: 'tab-1', panelId: 'tab-content-1' },
  {
    title: 'Réutilisations',
    tabId: 'tab-2',
    panelId: 'tab-content-2'
  },
  { title: 'Discussions', tabId: 'tab-3', panelId: 'tab-content-3' },
  { title: 'Sources', tabId: 'tab-4', panelId: 'tab-content-4' },
  { title: 'Détails techniques', tabId: 'tab-5', panelId: 'tab-content-5' }
]

const activeTab = ref(0)

const description = computed(() => descriptionFromMarkdown(indicator))
const spatialGranularity = useSpatialGranularity(indicator)

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
          <DatasetAddToTopicModal
            v-if="showAddToBouquetModal"
            v-model:show="showAddToBouquetModal"
            topic-page-key="bouquets"
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
      <DsfrTabContent panel-id="tab-content-0" tab-id="tab-0">
        <IndicatorInformationPanel :indicator="indicator" />
      </DsfrTabContent>

      <!-- Fichiers -->
      <DsfrTabContent panel-id="tab-content-1" tab-id="tab-1">
        <ResourcesList
          :dataset="indicator"
          no-file-message="Il n'y a pas encore de fichier pour cet indicateur."
        />
        <IndicatorAPIDocumentation :indicator="indicator" />
      </DsfrTabContent>

      <!-- Réutilisations -->
      <DsfrTabContent panel-id="tab-content-2" tab-id="tab-2">
        <ReusesList model="dataset" :object-id="indicator.id" />
      </DsfrTabContent>

      <!-- Discussions -->
      <DsfrTabContent panel-id="tab-content-3" tab-id="tab-3">
        <DiscussionsList
          :subject="indicator"
          subject-class="Dataset"
          empty-message="Pas de discussion pour cet indicateur."
        />
      </DsfrTabContent>

      <!-- Sources -->
      <DsfrTabContent panel-id="tab-content-4" tab-id="tab-4">
        <IndicatorSourcesList :indicator="indicator" />
      </DsfrTabContent>

      <!-- Détails techniques -->
      <DsfrTabContent panel-id="tab-content-5" tab-id="tab-5">
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
</style>
