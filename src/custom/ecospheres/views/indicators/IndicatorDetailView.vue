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
import { useDatasetStore } from '@/store/DatasetStore'
import { useUserStore } from '@/store/UserStore'
import { descriptionFromMarkdown, formatDate } from '@/utils'
import { useLicense } from '@/utils/dataset'
import IndicatorInformationPanel from '../../components/indicators/IndicatorInformationPanel.vue'

const route = useRouteParamsAsString()
const indicatorId = route.params.iid

const datasetStore = useDatasetStore()
const userStore = useUserStore()

const indicator = computed(() => datasetStore.get(indicatorId))

const selectedTabIndex = ref(0)
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
    title: 'Réutilisations et bouquets',
    tabId: 'tab-2',
    panelId: 'tab-content-2'
  },
  { title: 'Discussions', tabId: 'tab-3', panelId: 'tab-content-3' },
  { title: 'Sources', tabId: 'tab-4', panelId: 'tab-content-4' },
  { title: 'Métadonnées', tabId: 'tab-5', panelId: 'tab-content-5' }
]

const activeTab = ref(0)

const description = computed(() => descriptionFromMarkdown(indicator))
const license = useLicense(indicator)

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
      <div class="fr-col-12 fr-col-md-4">
        <h2 class="subtitle fr-mt-3v fr-mb-1v">Dernière mise à jour</h2>
        <p>{{ formatDate(indicator.last_update) }}</p>
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
      <DsfrTabContent panel-id="tab-content-0" tab-id="tab-0">
        <IndicatorInformationPanel :indicator="indicator" />
      </DsfrTabContent>

      <!-- Fichiers -->
      <DsfrTabContent
        v-if="indicator.resources.total"
        panel-id="tab-content-1"
        tab-id="tab-1"
      >
        <div v-if="selectedTabIndex === 0">
          <ResourcesList :dataset="indicator" />
        </div>
      </DsfrTabContent>

      <!-- Réutilisations -->
      <DsfrTabContent panel-id="tab-content-2" tab-id="tab-2">
        <ReusesList model="dataset" :object-id="indicator.id" />
      </DsfrTabContent>

      <!-- Discussions -->
      <DsfrTabContent panel-id="tab-content-3" tab-id="tab-3">
        <DiscussionsList :subject="indicator" />
      </DsfrTabContent>

      <!-- Sources -->
      <DsfrTabContent panel-id="tab-content-4" tab-id="tab-4">
        Sources
      </DsfrTabContent>

      <!-- Métadonnées -->
      <DsfrTabContent panel-id="tab-content-5" tab-id="tab-5">
        <InformationPanel
          v-if="indicator && license"
          :dataset="indicator"
          :license="license"
        />
      </DsfrTabContent>
    </DsfrTabs>
  </GenericContainer>
</template>
