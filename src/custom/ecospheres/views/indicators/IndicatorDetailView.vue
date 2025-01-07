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

const tabTitles = computed(() => {
  const _tabs = [
    { title: 'Fichiers', tabId: 'tab-0', panelId: 'tab-content-0' },
    { title: 'Réutilisations', tabId: 'tab-1', panelId: 'tab-content-1' },
    { title: 'Discussions', tabId: 'tab-2', panelId: 'tab-content-2' }
  ]
  _tabs.push({
    title: 'Informations',
    tabId: 'tab-3',
    panelId: 'tab-content-3'
  })
  return _tabs
})

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
      <!-- Fichiers -->
      <DsfrTabContent
        v-if="indicator.resources.total"
        panel-id="tab-content-0"
        tab-id="tab-0"
      >
        <div v-if="selectedTabIndex === 0">
          <ResourcesList :dataset="indicator" />
        </div>
      </DsfrTabContent>

      <!-- Réutilisations -->
      <DsfrTabContent panel-id="tab-content-1" tab-id="tab-1">
        <ReusesList model="dataset" :object-id="indicator.id" />
      </DsfrTabContent>

      <!-- Discussions -->
      <DsfrTabContent panel-id="tab-content-2" tab-id="tab-2">
        <DiscussionsList :subject="indicator" />
      </DsfrTabContent>

      <!-- Informations -->
      <DsfrTabContent
        v-show="indicator"
        panel-id="tab-content-3"
        tab-id="tab-3"
      >
        <InformationPanel
          v-if="indicator && license"
          :dataset="indicator"
          :license="license"
        />
      </DsfrTabContent>
    </DsfrTabs>
  </GenericContainer>
</template>
