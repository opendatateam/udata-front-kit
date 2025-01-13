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
import { descriptionFromMarkdown } from '@/utils'
import { useLicense } from '@/utils/dataset'
import { useSpatialGranularity } from '@/utils/spatial'
import IndicatorInformationPanel from '../../components/indicators/IndicatorInformationPanel.vue'
import IndicatorSourcesList from '../../components/indicators/IndicatorSourcesList.vue'
import IndicatorTags from '../../components/indicators/IndicatorTags.vue'
import InformationPanelItem from '../../components/indicators/informations/InformationPanelItem.vue'
import InformationPanelSection from '../../components/indicators/informations/InformationPanelSection.vue'
import type { Indicator } from '../../model/indicator'
import { useIndicatorExtras } from '../../utils/indicator'

const route = useRouteParamsAsString()
const indicatorId = route.params.iid

const datasetStore = useDatasetStore()
const userStore = useUserStore()

const indicator = computed(() => datasetStore.get(indicatorId) as Indicator)
const { unite, axes, cubes, internalId } = useIndicatorExtras(indicator)

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
  { title: 'Métadonnées', tabId: 'tab-5', panelId: 'tab-content-5' }
]

const activeTab = ref(0)

const description = computed(() => descriptionFromMarkdown(indicator))
const license = useLicense(indicator)
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
        <p>{{ spatialGranularity?.name || '-' }}</p>
        <h2 class="subtitle fr-mt-3v fr-mb-1v">Unité</h2>
        <p>{{ unite || '-' }}</p>
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
        <ResourcesList :dataset="indicator" />
        <InformationPanelSection title="Documentation utilisation API">
          <template #description
            >Senectus et rutrum tempus enim. Laoreet blandit at lacus elementum
            gravida.</template
          >
          <InformationPanelItem
            title="Nom cubes API"
            :value="cubes.join(', ')"
          />
          <InformationPanelItem title="Id indicateur" :value="internalId" />
          <template v-for="(values, axis, index) in axes" :key="axis">
            <InformationPanelItem :title="`Axe n°${index + 1} - ${axis}`">
              <ul>
                <li v-for="value in values" :key="value">{{ value }}</li>
              </ul>
            </InformationPanelItem>
          </template>
        </InformationPanelSection>
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
        <IndicatorSourcesList :indicator="indicator" />
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

<style scoped>
:deep(.subtitle) {
  font-size: 1rem;
}
</style>
