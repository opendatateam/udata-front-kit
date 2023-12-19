<script setup>
import {
  ResourceAccordion,
  OrganizationNameWithCertificate,
  Pagination,
  QualityComponent,
  ReadMore,
  Well
} from '@etalab/data.gouv.fr-components'
import { computed, onMounted, ref, watch } from 'vue'
import { useLoading } from 'vue-loading-overlay'
import { useRoute } from 'vue-router'

import config from '@/config'

import ChartData from '../../components/ChartData.vue'
import DiscussionsList from '../../components/DiscussionsList.vue'
import { useDatasetStore } from '../../store/DatasetStore'
import { useReuseStore } from '../../store/ReuseStore'
import { descriptionFromMarkdown, formatDate } from '../../utils'

const route = useRoute()
const datasetId = route.params.did

const datasetStore = useDatasetStore()
const reuseStore = useReuseStore()

const dataset = computed(() => datasetStore.get(datasetId) || {})
const reuses = ref([])
const resources = ref({})
const selectedTabIndex = ref(0)
const license = ref({})
const types = ref([])
const pageSize = config.website.pagination_sizes.files_list
const showDiscussions = config.website.discussions.dataset.display
const blankReuse = '/blank_state/reuse.svg'

const updateQuery = (q, typeId) => {
  resources.value[typeId].query = q
  changePage(typeId, 1, q)
}

const doSearch = (typeId) => {
  changePage(typeId, 1, resources.value[typeId].query)
}

onMounted(() => {
  datasetStore.load(datasetId)
})

const chartData = computed(() => {
  if (!dataset.value?.extras) return
  return dataset.value.extras['config:charts']
})

const links = computed(() => [
  { to: '/', text: 'Accueil' },
  { to: '/datasets', text: 'Données' },
  { text: dataset.value.title }
])

const tabs = computed(() => {
  const _tabs = [
    { title: 'Fichiers', tabId: 'tab-0', panelId: 'tab-content-0' },
    { title: 'Réutilisations', tabId: 'tab-1', panelId: 'tab-content-1' },
    { title: 'Discussions', tabId: 'tab-2', panelId: 'tab-content-2' }
  ]
  if (config.website.show_dataset_metadata_panel) {
    _tabs.push({
      title: 'Métadonnées',
      tabId: 'tab-4',
      panelId: 'tab-content-4'
    })
  }
  if (chartData.value) {
    _tabs.push({
      title: 'Visualisations',
      tabId: 'tab-00',
      panelId: 'tab-content-00'
    })
  }
  return _tabs
})

const description = computed(() => descriptionFromMarkdown(dataset))

const changePage = (type, page = 1, query = '') => {
  resources.value[type].currentPage = page
  resources.value[type].query = query
  return datasetStore
    .fetchDatasetResources(dataset.value.id, type, page, pageSize, query)
    .then((data) => {
      resources.value[type].resources = data['data']
      resources.value[type].total = data['total']
    })
}

const simpleDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('default', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date)
}

const cropString = (string) => {
  if (string.length <= 40) {
    return string
  } else {
    return string.slice(0, 40) + '...'
  }
}

const reuseDescription = (r) => {
  if (r.organization?.name) {
    return (
      'Publié le ' +
        simpleDate(r.created_at) +
        ' par ' +
        r.organization?.name || r.owner.first_name + ' ' + r.owner.last_name
    )
  } else {
    return (
      'Publié le ' +
      simpleDate(r.created_at) +
      ' par ' +
      r.owner.first_name +
      ' ' +
      r.owner.last_name
    )
  }
}

const getResourcesTitle = (typedResources) => {
  if (typedResources?.total > 1) {
    let pluralName
    switch (typedResources.typeId) {
      case 'main':
        pluralName = 'Fichiers principaux'
        break
      case 'documentation':
        pluralName = 'Documentations'
        break
      case 'update':
        pluralName = 'Mises à jour'
        break
      case 'api':
        pluralName = 'APIs'
        break
      case 'code':
        pluralName = 'Dépôts de code'
        break
      case 'other':
        pluralName = 'Autres'
        break
      default:
        pluralName = typedResources.typeLabel
    }
    return `${typedResources.total} ${pluralName}`
  } else {
    return typedResources.typeLabel
  }
}

const getType = (id) => {
  const type = types.value.find((t) => t.id === id)
  return type?.label || ''
}

const discussionWellTitle = showDiscussions
  ? 'Participer aux discussions'
  : 'Voir les discussions'
const discussionWellDescription = showDiscussions
  ? 'Vous avez une question sur ce jeu de données ? Rendez-vous sur data.gouv.fr pour participer aux discussions.'
  : 'Vous avez une question sur ce jeu de données ? Rendez-vous sur data.gouv.fr pour voir les discussions.'

const openDataGouvDiscussions = () =>
  window.open(`${dataset.value.page}#/discussions`, 'datagouv-discussion')

// launch reuses and discussions fetch as soon as we have the technical id
watch(
  dataset,
  async () => {
    if (!dataset.value.id) return
    // fetch reuses
    reuseStore
      .loadReusesForDataset(dataset.value.id)
      .then((r) => (reuses.value = r))
    // fetch ressources if need be
    if (dataset.value.resources.rel) {
      const resourceLoader = useLoading().show()
      const allResources = await datasetStore.loadResources(
        dataset.value.resources,
        pageSize
      )
      for (const typedResources of allResources) {
        resources.value[typedResources.typeId] = typedResources
        resources.value[typedResources.typeId]['totalWithoutFilter'] =
          typedResources.total
      }
      resourceLoader.hide()
    } else {
      resources.value = dataset.value.resources
    }
    license.value = await datasetStore.getLicense(dataset.value.license)
    types.value = await reuseStore.getTypes()
  },
  { immediate: true }
)
</script>

<template>
  <div class="fr-container">
    <DsfrBreadcrumb class="fr-mb-1v" :links="links" />
  </div>
  <div class="fr-container datagouv-components fr-mb-4w">
    <div class="fr-grid-row fr-grid-row--gutters">
      <div class="fr-col-12 fr-col-md-8">
        <h1 class="fr-mb-2v">{{ dataset.title }}</h1>
        <ReadMore max-height="600">
          <div v-html="description"></div>
        </ReadMore>
      </div>
      <div v-if="dataset.organization" class="fr-col-12 fr-col-md-4">
        <h2 id="producer" class="subtitle fr-mb-1v">Producteur</h2>
        <div class="fr-grid-row fr-grid-row--middle">
          <div class="fr-col-auto">
            <div class="border fr-p-1-5v fr-mr-1-5v">
              <img :src="dataset.organization.logo" height="32" />
            </div>
          </div>
          <p class="fr-col fr-m-0">
            <a class="fr-link" :href="dataset.organization.page">
              <OrganizationNameWithCertificate
                :organization="dataset.organization"
              />
            </a>
          </p>
        </div>
        <h2 class="subtitle fr-mt-3v fr-mb-1v">Dernière mise à jour</h2>
        <p>{{ formatDate(dataset.last_update) }}</p>
        <div v-if="dataset.license">
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
          :quality="dataset.quality"
        />
      </div>
    </div>

    <DsfrTabs
      class="fr-mt-2w"
      tab-list-name="Groupes d'attributs du jeu de données"
      :tab-titles="tabs"
      :initial-selected-index="0"
      :selected-tab-index="selectedTabIndex"
      @select-tab="(idx) => (selectedTabIndex = idx)"
    >
      <!-- Fichiers -->
      <DsfrTabContent
        v-if="resources"
        panel-id="tab-content-0"
        tab-id="tab-0"
        :selected="selectedTabIndex === 0"
      >
        <div class="datagouv-components" v-if="selectedTabIndex === 0">
          <template v-for="typedResources in resources">
            <div v-if="typedResources.totalWithoutFilter" class="fr-mb-4w">
              <h2 class="fr-mb-1v subtitle subtitle--uppercase">
                {{ getResourcesTitle(typedResources) }}
              </h2>
              <DsfrSearchBar
                v-if="typedResources.totalWithoutFilter > pageSize"
                button-text="Rechercher"
                placeholder="Rechercher"
                :large="false"
                class="search-bar"
                @search="() => doSearch(typedResources.typeId)"
                @update:model-value="
                  (value) => updateQuery(value, typedResources.typeId)
                "
              />
              <span v-if="typedResources.resources.length != 0">
                <ResourceAccordion
                  v-for="resource in typedResources.resources"
                  :datasetId="datasetId"
                  :resource="resource"
                />
                <Pagination
                  class="fr-mt-3w"
                  v-if="typedResources.total > pageSize"
                  :page="typedResources.currentPage"
                  :page-size="pageSize"
                  :total-results="typedResources.total"
                  @change="
                    (page) =>
                      changePage(
                        typedResources.typeId,
                        page,
                        typedResources.query
                      )
                  "
                />
              </span>
              <span v-else> <br />Aucun résultat pour votre recherche. </span>
            </div>
          </template>
        </div>
      </DsfrTabContent>

      <!-- Réutilisations -->
      <DsfrTabContent
        panel-id="tab-content-1"
        tab-id="tab-1"
        :selected="selectedTabIndex === 1"
      >
        <div
          v-if="!reuses.length"
          class="fr-grid-row flex-direction-column fr-grid-row--middle fr-mt-5w"
        >
          <img
            class="fr-responsive-img"
            :src="blankReuse"
            style="height: 105px; width: 130px"
          />
          <p class="fr-h6 fr-mt-2w fr-mb-5v text-center">
            Il n'y a pas encore de réutilisation pour ce jeu de données.
          </p>
          <p>
            <a
              class="fr-btn fr-btn--secondary fr-btn--secondary-grey-500 fr-ml-1w"
              href="https://guides.data.gouv.fr/publier-des-donnees/guide-data.gouv.fr/reutilisations"
            >
              Qu'est-ce qu'une réutilisation ?
            </a>
          </p>
        </div>
        <div v-else>
          <h2 class="fr-mt-4w">Réutilisations</h2>
          <ul class="fr-grid-row fr-grid-row--gutters es__tiles__list">
            <li v-for="r in reuses" class="fr-col-12 fr-col-md-6 fr-col-lg-3">
              <DsfrCard
                :link="r.page"
                :style="`max-width: 400px; max-height: 400px`"
                :title="cropString(r.title)"
                :detail="getType(r.type)"
                :description="reuseDescription(r)"
                size="sm"
                :imgSrc="
                  r.image_thumbnail || r.organization?.logo || r.owner.avatar
                "
              />
            </li>
          </ul>
        </div>
      </DsfrTabContent>

      <!-- Discussions -->
      <DsfrTabContent
        panel-id="tab-content-2"
        tab-id="tab-2"
        :selected="selectedTabIndex === 2"
      >
        <Well color="blue-cumulus" weight="regular">
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
                icon="ri-external-link-line"
                :icon-right="true"
                @click="openDataGouvDiscussions"
              />
            </div>
          </div>
        </Well>
        <DiscussionsList v-if="showDiscussions" :subject="dataset" />
      </DsfrTabContent>

      <!-- Métadonnées -->
      <DsfrTabContent
        panel-id="tab-content-4"
        tab-id="tab-4"
        :selected="selectedTabIndex === 4"
      >
        <pre>{{ dataset }}</pre>
      </DsfrTabContent>

      <!-- Visualisations -->
      <DsfrTabContent
        v-if="chartData"
        panel-id="tab-content-00"
        tab-id="tab-00"
        :selected="selectedTabIndex === 5"
      >
        <ChartData v-if="chartData" :chart-data="chartData" />
      </DsfrTabContent>
    </DsfrTabs>
  </div>
</template>

<style scoped lang="scss">
pre {
  white-space: pre-wrap;
}
</style>
