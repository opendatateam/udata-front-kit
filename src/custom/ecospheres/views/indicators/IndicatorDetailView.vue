<script setup lang="ts">
import {
  AppLink,
  InformationPanel,
  OrganizationNameWithCertificate,
  QualityComponent,
  ReadMore,
  type License
} from '@datagouv/components'
import { storeToRefs } from 'pinia'
import { computed, inject, onMounted, ref, watch } from 'vue'

import DiscussionsList from '@/components/DiscussionsList.vue'
import GenericContainer from '@/components/GenericContainer.vue'
import ReusesList from '@/components/ReusesList.vue'
import DatasetAddToBouquetModal from '@/components/datasets/DatasetAddToBouquetModal.vue'
import ExtendedInformationPanel from '@/components/datasets/ExtendedInformationPanel.vue'
import ResourcesList from '@/components/datasets/ResourcesList.vue'
import config from '@/config'
import {
  AccessibilityPropertiesKey,
  type AccessibilityPropertiesType
} from '@/model/injectionKeys'
import { useRouteParamsAsString } from '@/router/utils'
import { useDatasetStore } from '@/store/DatasetStore'
import { useUserStore } from '@/store/UserStore'
import { descriptionFromMarkdown, formatDate } from '@/utils'
import { useTopicsConf } from '@/utils/config'

const route = useRouteParamsAsString()
const indicatorId = route.params.iid

const datasetStore = useDatasetStore()
const userStore = useUserStore()
const { canAddBouquet } = storeToRefs(userStore)

const indicator = computed(() => datasetStore.get(indicatorId))

const selectedTabIndex = ref(0)
const license = ref<License>()
const showAddToBouquetModal = ref(false)

const { topicsName } = useTopicsConf()

const setAccessibilityProperties = inject(
  AccessibilityPropertiesKey
) as AccessibilityPropertiesType

const links = computed(() => [
  { to: '/', text: 'Accueil' },
  { to: '/datasets', text: 'Données' },
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

const showHarvestQualityWarning = computed(() => {
  const backend = indicator.value?.harvest?.backend
  const warningBackends =
    config.website.datasets.harvest_backends_quality_warning || []
  return backend && warningBackends.includes(backend)
})

onMounted(() => {
  datasetStore
    .load(indicatorId, { toasted: false, redirectNotFound: true })
    .then(() => {
      setAccessibilityProperties(indicator.value?.title)
    })
})

watch(
  indicator,
  async () => {
    if (!indicator.value) return
    license.value = await datasetStore.getLicense(indicator.value.license)
  },
  { immediate: true }
)
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
        <h2 id="producer" class="subtitle fr-mb-1v">Producteur</h2>
        <div
          v-if="indicator.organization"
          class="fr-grid-row fr-grid-row--middle"
        >
          <div class="fr-col-auto">
            <div class="border fr-p-1-5v fr-mr-1-5v">
              <img
                :src="indicator.organization.logo"
                alt=""
                loading="lazy"
                height="32"
              />
            </div>
          </div>
          <p class="fr-col fr-m-0">
            <a class="fr-link" :href="indicator.organization.page">
              <OrganizationNameWithCertificate
                :organization="indicator.organization"
              />
            </a>
          </p>
        </div>
        <div v-if="indicator.harvest?.remote_url" class="fr-my-3v fr-text--sm">
          <div class="bg-alt-blue-cumulus fr-p-3v fr-mb-1w">
            <p class="fr-grid-row fr-grid-row--middle fr-my-0">
              Ce jeu de données provient d'un portail externe.
              <AppLink
                :to="indicator.harvest.remote_url"
                target="_blank"
                rel="noopener nofollow"
                >Voir la source originale.</AppLink
              >
            </p>
          </div>
        </div>
        <h2 class="subtitle fr-mt-3v fr-mb-1v">Dernière mise à jour</h2>
        <p>{{ formatDate(indicator.last_update) }}</p>
        <div v-if="license">
          <h2 class="subtitle fr-mt-3v fr-mb-1v">Licence</h2>
          <p class="fr-text--sm fr-mt-0 fr-mb-3v">
            <code class="bg-alt-grey fr-px-1v text-grey-380">
              <a :href="license.url">
                {{ license.title }}
              </a>
            </code>
          </p>
        </div>
        <QualityComponent
          v-if="config.website.show_quality_component"
          :quality="indicator.quality"
        />
        <div
          v-if="showHarvestQualityWarning"
          class="text-mention-grey fr-text--sm fr-my-1v"
        >
          <VIconCustom name="warning-line" class="fr-icon--sm" />
          La qualité des métadonnées peut être trompeuse car les métadonnées de
          la source originale peuvent avoir été perdues lors de leur
          récupération. Nous travaillons actuellement à améliorer la situation.
        </div>
        <div
          v-if="
            config.website.datasets.add_to_bouquet &&
            userStore.loggedIn &&
            canAddBouquet
          "
        >
          <DsfrButton
            class="fr-mt-2w"
            size="md"
            :label="`Ajouter à un ${topicsName}`"
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
        v-show="indicator && license"
        panel-id="tab-content-3"
        tab-id="tab-3"
      >
        <ExtendedInformationPanel
          v-if="
            config.website.datasets.show_extended_information_panel && indicator
          "
          :dataset="indicator"
        />
        <InformationPanel
          v-if="indicator && license"
          :dataset="indicator"
          :license="license"
        />
      </DsfrTabContent>
    </DsfrTabs>
  </GenericContainer>
</template>
