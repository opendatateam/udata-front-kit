<script setup lang="ts">
import {
  AppLink,
  InformationPanel,
  OrganizationNameWithCertificate,
  QualityComponent,
  ReadMore,
  Well
} from '@datagouv/components'
import { storeToRefs } from 'pinia'
import { computed, inject, onMounted, ref } from 'vue'

import DiscussionsList from '@/components/DiscussionsList.vue'
import GenericContainer from '@/components/GenericContainer.vue'
import OrganizationLogo from '@/components/OrganizationLogo.vue'
import ReusesList from '@/components/ReusesList.vue'
import ContactPoints from '@/components/datasets/ContactPoints.vue'
import DatasetAddToTopicModal from '@/components/datasets/DatasetAddToTopicModal.vue'
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
import { descriptionFromMarkdown, formatDate } from '@/utils'
import { useDatasetsConf, usePageConf } from '@/utils/config'
import { useLicense } from '@/utils/dataset'

const route = useRouteParamsAsString()
const datasetId = route.params.item_id

const datasetStore = useDatasetStore()
const userStore = useUserStore()
const { canAddTopic } = storeToRefs(userStore)

const dataset = computed(() => datasetStore.get(datasetId))

const showAddToTopicModal = ref(false)

const { pageKey, pageConf } = useCurrentPageConf()
const showDiscussions = pageConf.resources_tabs.discussions.display

const datasetsConf = useDatasetsConf()
const topicPageConf = datasetsConf.add_to_topic?.page
  ? usePageConf(datasetsConf.add_to_topic.page)
  : null

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
  { title: 'Réutilisations', tabId: 'tab-1', panelId: 'tab-content-1' },
  { title: 'Discussions', tabId: 'tab-2', panelId: 'tab-content-2' },
  { title: 'Informations', tabId: 'tab-3', panelId: 'tab-content-3' }
]

const activeTab = ref(0)

const description = computed(() => descriptionFromMarkdown(dataset))
const license = useLicense(dataset)

const showHarvestQualityWarning = computed(() => {
  const backend = dataset.value?.harvest?.backend
  const warningBackends = datasetsConf.harvest_backends_quality_warning || []
  return backend && warningBackends.includes(backend)
})

const discussionWellTitle = showDiscussions
  ? 'Participer aux discussions'
  : 'Voir les discussions'
const discussionWellDescription = showDiscussions
  ? 'Vous avez une question sur ce jeu de données ? Rendez-vous sur data.gouv.fr pour participer aux discussions.'
  : 'Vous avez une question sur ce jeu de données ? Rendez-vous sur data.gouv.fr pour voir les discussions.'

const openDataGouvDiscussions = () =>
  window.open(`${dataset.value?.page}#/discussions`, 'datagouv-discussion')

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
  <GenericContainer v-if="dataset">
    <div class="fr-grid-row fr-grid-row--gutters">
      <div class="fr-col-12 fr-col-md-8">
        <h1 class="fr-mb-2v">{{ dataset.title }}</h1>
        <ReadMore max-height="600">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-html="description"></div>
        </ReadMore>
      </div>
      <div class="fr-col-12 fr-col-md-4">
        <h2 id="producer" class="subtitle fr-mb-1v">
          <span v-if="dataset.contact_points.length">Éditeur</span>
          <span v-else>Producteur</span>
        </h2>
        <div
          v-if="dataset.organization"
          class="fr-grid-row fr-grid-row--middle"
        >
          <OrganizationLogo :object="dataset" :size="32" class="fr-mr-1-5v" />
          <p class="fr-col fr-m-0">
            <a class="fr-link" :href="dataset.organization.page">
              <OrganizationNameWithCertificate
                :organization="dataset.organization"
              />
            </a>
          </p>
        </div>
        <template v-if="dataset.contact_points.length">
          <h2 id="attributions" class="subtitle fr-mb-1v fr-mt-3v">
            Attributions
          </h2>
          <ContactPoints :contact-points="dataset.contact_points" />
        </template>
        <div v-if="dataset.harvest?.remote_url" class="fr-my-3v fr-text--sm">
          <div class="bg-alt-blue-cumulus fr-p-3v fr-mb-1w">
            <p class="fr-grid-row fr-grid-row--middle fr-my-0">
              Ce jeu de données provient d'un portail externe.
              <AppLink
                :to="dataset.harvest.remote_url"
                target="_blank"
                rel="noopener nofollow"
                >Voir la source originale.</AppLink
              >
            </p>
          </div>
        </div>
        <template v-if="dataset.harvest">
          <template v-if="dataset.harvest.modified_at">
            <h2 class="subtitle fr-mt-3v fr-mb-1v">Dernière révision</h2>
            <p>
              {{ formatDate(dataset.harvest.modified_at) }}
            </p>
          </template>
        </template>
        <template v-else>
          <h2 class="subtitle fr-mt-3v fr-mb-1v">Dernière mise à jour</h2>
          <p>{{ formatDate(dataset.last_update) }}</p>
        </template>
        <template v-if="license">
          <h2 class="subtitle fr-mt-3v fr-mb-1v">Licence</h2>
          <p class="fr-text--sm fr-mt-0 fr-mb-3v">
            <code class="bg-alt-grey fr-px-1v text-grey-380">
              <a :href="license.url">
                {{ license.title }}
              </a>
            </code>
          </p>
        </template>
        <QualityComponent
          v-if="config.website.show_quality_component"
          :quality="dataset.quality"
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
        <!-- add dataset to topic (if enabled) -->
        <div v-if="topicPageConf && userStore.loggedIn && canAddTopic">
          <DsfrButton
            class="fr-mt-2w"
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
      <DsfrTabContent panel-id="tab-content-0" tab-id="tab-0">
        <ResourcesList :dataset="dataset" />
      </DsfrTabContent>

      <!-- Réutilisations -->
      <DsfrTabContent panel-id="tab-content-1" tab-id="tab-1">
        <ReusesList model="dataset" :object-id="dataset.id" />
      </DsfrTabContent>

      <!-- Discussions -->
      <DsfrTabContent panel-id="tab-content-2" tab-id="tab-2">
        <Well
          v-if="!pageConf.resources_tabs.discussions.create"
          color="blue-cumulus"
          weight="regular"
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
        </Well>
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
        <InformationPanel
          v-if="dataset && license"
          :dataset="dataset"
          :license="license"
        />
      </DsfrTabContent>
    </DsfrTabs>
  </GenericContainer>
</template>
