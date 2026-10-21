<script setup lang="ts">
import { useCanonicalUrl, useMeta } from '@/utils/seo'
import { ReadMore } from '@datagouv/components-next'
import { capitalize, computed, onMounted, ref, useTemplateRef } from 'vue'

import DiscussionsList from '@/components/DiscussionsList.vue'
import GenericContainer from '@/components/GenericContainer.vue'
import TabsWithCounts from '@/components/TabsWithCounts.vue'
import DatasetAddToTopicModal from '@/components/datasets/DatasetAddToTopicModal.vue'
import DatasetDataservicesList from '@/components/datasets/DatasetDataservicesList.vue'
import DatasetReusesList from '@/components/datasets/DatasetReusesList.vue'
import DatasetSidebar from '@/components/datasets/DatasetSidebar.vue'
import ResourcesTabContent from '@/components/datasets/ResourcesTabContent.vue'
import config from '@/config'
import IndicatorVizChart from '@/custom/ecospheres/components/indicators/viz/IndicatorVizChart.vue'
import { useRouteParamsAsString } from '@/router/utils'
import { useDatasetStore } from '@/store/DatasetStore'
import { useUserStore } from '@/store/UserStore'
import { descriptionFromMarkdown } from '@/utils'
import { usePageConf } from '@/utils/config'
import { useLabels } from '@/utils/labels'
import { Tab, tabIds, useRoutedTabs } from '@/utils/tabs'
import IndicatorInformationPanel from '../../components/indicators/IndicatorInformationPanel.vue'
import IndicatorSourcesList from '../../components/indicators/IndicatorSourcesList.vue'
import IndicatorTags from '../../components/indicators/IndicatorTags.vue'
import type { Indicator } from '../../model/indicator'

const route = useRouteParamsAsString()
const indicatorId = route.params.item_id
const router = useRouter()

const datasetStore = useDatasetStore()
const userStore = useUserStore()

const indicator = computed(() => datasetStore.get(indicatorId) as Indicator)

const tabularApiUrl = config.datagouvfr?.tabular_api_url

const showAddToTopicModal = ref(false)
const indicatorConf = usePageConf('indicators')
const labels = useLabels(indicatorConf.labels)
const topicConf = usePageConf('bouquets')
const topicsLabels = useLabels(topicConf.labels)

const links = computed(() => [
  { to: '/', text: 'Accueil' },
  { to: '/indicators', text: indicatorConf.breadcrumb_title },
  { text: indicator.value?.title || '' }
])

const discussionsList =
  useTemplateRef<InstanceType<typeof DiscussionsList>>('discussionsList')

const { tabs, activeIndex } = useRoutedTabs(() => [
  {
    slug: Tab.PREVIEW,
    title: 'Prévisualisation',
    visible:
      !!indicator.value?.extras['ecospheres-indicateurs'].enable_visualization
  },
  {
    slug: Tab.FILES,
    title: 'Fichiers',
    count: indicator.value?.resources.total ?? 0
  },
  {
    slug: Tab.SOURCES,
    title: 'Sources',
    count: indicator.value?.extras['ecospheres-indicateurs'].sources.length ?? 0
  },
  {
    slug: Tab.REUSES_AND_DATASERVICES,
    title: 'Réutilisations et API',
    count:
      (indicator.value?.metrics.reuses ?? 0) +
      (indicator.value?.metrics.dataservices ?? 0)
  },
  {
    slug: Tab.DISCUSSIONS,
    title: 'Discussions',
    count:
      discussionsList.value?.total ?? indicator.value?.metrics.discussions ?? 0
  },
  { slug: Tab.INFORMATIONS, title: 'Informations' }
])

const description = computed(() => descriptionFromMarkdown(indicator))

useMeta({
  title: () =>
    indicator.value?.title &&
    `${capitalize(labels.singular)} - ${indicator.value.title}`,
  description: () => indicator.value?.description,
  canonicalUrl: useCanonicalUrl(() => {
    const slug = indicator.value?.slug
    if (!slug) return null
    return { name: 'indicators_detail', params: { item_id: slug } }
  })
})

onMounted(() => {
  datasetStore
    .load(indicatorId, { toasted: false, redirectNotFound: true })
    .then(() => {
      if (indicator.value?.slug && indicator.value.slug !== indicatorId) {
        const current = router.currentRoute.value
        router.replace({
          name: 'indicators_detail',
          params: { ...current.params, item_id: indicator.value.slug },
          query: current.query
        })
      }
    })
})
</script>

<template>
  <div class="fr-container fr-grid-row fr-grid-row--middle fr-mt-1v">
    <div class="fr-col">
      <DsfrBreadcrumb class="fr-mb-1v" :links="links" />
    </div>
    <div
      v-if="indicator && userStore.loggedIn"
      class="fr-col-auto fr-grid-row fr-grid-row--middle flex-gap"
    >
      <DsfrButton
        secondary
        size="sm"
        :label="`Ajouter à ${topicsLabels.articles.un} ${topicsLabels.singular}`"
        icon="fr-icon-file-add-line"
        @click="showAddToTopicModal = true"
      />
      <DatasetAddToTopicModal
        v-if="showAddToTopicModal"
        v-model:show="showAddToTopicModal"
        topic-page-key="bouquets"
        :dataset="indicator"
      />
    </div>
  </div>
  <GenericContainer v-if="indicator">
    <div class="fr-grid-row fr-grid-row--gutters fr-mt-1w">
      <div class="fr-col-12 fr-col-md-8">
        <div class="fr-mb-4v">
          <h1 class="fr-mb-1v fr-mr-2v">{{ indicator.title }}</h1>
          <IndicatorTags :indicator="indicator" />
        </div>
        <ReadMore max-height="600">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-html="description"></div>
        </ReadMore>
      </div>
      <DatasetSidebar :dataset="indicator" />
    </div>

    <TabsWithCounts
      v-model="activeIndex"
      class="fr-mt-2w"
      tab-list-name="Groupes d'attributs du jeu de données"
      :tabs="tabs"
    >
      <!-- Fichiers -->
      <DsfrTabContent v-bind="tabIds(Tab.FILES)">
        <ResourcesTabContent
          :dataset="indicator"
          no-file-message="Il n'y a pas encore de fichier pour cet indicateur."
          from-route-name="indicators_detail"
        />
      </DsfrTabContent>

      <!-- Prévisualisation -->
      <DsfrTabContent v-bind="tabIds(Tab.PREVIEW)">
        <IndicatorVizChart
          v-if="tabularApiUrl"
          :indicator="indicator"
          :tabular-api-url="tabularApiUrl"
        />
      </DsfrTabContent>

      <!-- Réutilisations et API -->
      <DsfrTabContent v-bind="tabIds(Tab.REUSES_AND_DATASERVICES)">
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
      <DsfrTabContent v-bind="tabIds(Tab.DISCUSSIONS)">
        <DiscussionsList
          ref="discussionsList"
          :subject="indicator"
          subject-class="Dataset"
          empty-message="Il n'y a pas encore de discussion pour cet indicateur."
        />
      </DsfrTabContent>

      <!-- Sources -->
      <DsfrTabContent v-bind="tabIds(Tab.SOURCES)">
        <IndicatorSourcesList :indicator="indicator" />
      </DsfrTabContent>

      <!-- Informations -->
      <DsfrTabContent v-bind="tabIds(Tab.INFORMATIONS)">
        <IndicatorInformationPanel :indicator="indicator" />
      </DsfrTabContent>
    </TabsWithCounts>
  </GenericContainer>
</template>
