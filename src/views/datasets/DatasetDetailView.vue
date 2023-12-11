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
import { useDatasetStore } from '../../store/DatasetStore'
import { useDiscussionStore } from '../../store/DiscussionStore'
import { useReuseStore } from '../../store/ReuseStore'
import { descriptionFromMarkdown } from '../../utils'

const route = useRoute()
const datasetId = route.params.did

const datasetStore = useDatasetStore()
const reuseStore = useReuseStore()
const discussionStore = useDiscussionStore()

const dataset = computed(() => datasetStore.get(datasetId) || {})
const discussionsPages = ref([])
const reuses = ref([])
const resources = ref({})
const discussions = ref({})
const discussionsPage = ref(1)
const expandedDiscussion = ref(null)
const selectedTabIndex = ref(0)
const license = ref({})
const types = ref([])
const currentPage = ref(1)
const pageSize = config.website.pagination_sizes.files_list
const showDiscussions = config.website.show_dataset_discussions
const query = ref('')

const updateQuery = (q) => {
  query.value = q
  changePage('main', 1)
}

const doSearch = () => {
  changePage('main', 1)
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
    { title: 'Discussions', tabId: 'tab-2', panelId: 'tab-content-2' },
    { title: 'Qualité', tabId: 'tab-3', panelId: 'tab-content-3' }
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

const changePage = (type, page = 1) => {
  resources.value[type].currentPage = page
  return datasetStore
    .fetchDatasetResources(dataset.value.id, type, page, pageSize, query.value)
    .then((data) => {
      resources.value[type].resources = data['data']
      resources.value[type].total = data['total']
    })
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('default', {
    dateStyle: 'full',
    timeStyle: 'short'
  }).format(date)
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

const getType = (id) => {
  let type = types.value.find((t) => t.id == id)
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
    // fetch discussions
    discussionStore
      .loadDiscussionsForDataset(dataset.value.id, discussionsPage.value)
      .then((d) => {
        discussions.value = d
        if (!discussionsPage.value.length) {
          discussionsPages.value =
            discussionStore.getDiscussionsPaginationForDataset(dataset.value.id)
        }
      })
    // fetch ressources if need be
    if (dataset.value.resources.rel) {
      const resourceLoader = useLoading().show()
      const allResources = await datasetStore.loadResources(
        dataset.value.resources,
        pageSize
      )
      for (let typedResources of allResources) {
        resources.value[typedResources.typeId] = typedResources
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
    <DsfrBreadcrumb :links="links" />
  </div>
  <div class="fr-container datagouv-components fr-mb-4w">
    <div class="fr-grid-row fr-grid-row--gutters">
      <div class="fr-col-12 fr-col-md-8">
        <h1>{{ dataset.title }}</h1>
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
            <div v-if="typedResources.total" class="fr-mb-4w">
              <h2 class="fr-mb-1v subtitle subtitle--uppercase">
                {{ typedResources.typeLabel }}
              </h2>
              <DsfrSearchBar
                button-text="Rechercher"
                placeholder="Rechercher"
                :large="false"
                class="search-bar"
                @search="doSearch"
                @update:modelValue="updateQuery"
                v-if="
                  typedResources.typeLabel != 'Documentation' &&
                  (typedResources.total > 6 ||
                    (typedResources.total <= 6 && query != ''))
                "
              />

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
                @change="(page) => changePage(typedResources.typeId, page)"
              />
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
        <h2 class="fr-mt-4w">Réutilisations</h2>
        <div v-if="!reuses.length">
          Pas de réutilisation pour ce jeu de données.
        </div>
        <ul v-else class="fr-grid-row fr-grid-row--gutters es__tiles__list">
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
        <template v-if="showDiscussions">
          <h2 class="fr-mt-4w">Discussions</h2>
          <div v-if="!discussions.data?.length">
            Pas de discussion pour ce jeu de données.
          </div>
          <DsfrAccordionsGroup>
            <li v-for="discussion in discussions.data">
              <DsfrAccordion
                :id="discussion.id"
                :title="discussion.title"
                :expanded-id="expandedDiscussion"
                @expand="(id) => (expandedDiscussion = id)"
              >
                <template #default>
                  <ul class="es__comment__container">
                    <li v-for="comment in discussion.discussion">
                      <div class="es__comment__metadata fr-mb-1v">
                        <span class="es__comment__author"
                          >{{ comment.posted_by.first_name }}
                          {{ comment.posted_by.last_name }}</span
                        >
                        <span class="es__comment__date fr-ml-1v"
                          >le {{ formatDate(comment.posted_on) }}</span
                        >
                      </div>
                      <div class="es__comment__content">
                        {{ comment.content }}
                      </div>
                    </li>
                  </ul>
                </template>
              </DsfrAccordion>
            </li>
          </DsfrAccordionsGroup>
          <DsfrPagination
            v-if="discussionsPages.length"
            class="fr-mt-2w"
            :current-page="discussionsPage - 1"
            :pages="discussionsPages"
            @update:current-page="(p) => (discussionsPage = p + 1)"
          />
        </template>
      </DsfrTabContent>

      <!-- Qualité -->
      <DsfrTabContent
        panel-id="tab-content-3"
        tab-id="tab-3"
        :selected="selectedTabIndex === 3"
      >
        <p>
          Analyse de la qualité des métadonnées récupérées et exposées par
          data.gouv.fr.
        </p>
        <ul v-if="dataset.quality" class="es__quality">
          <li>
            <span v-if="dataset.quality.dataset_description_quality">
              <VIcon name="ri-check-line" /> Description des données renseignée
            </span>
            <span v-else>
              <VIcon name="ri-close-circle-line" /> Description des données non
              renseignée
            </span>
          </li>
          <li>
            <span v-if="dataset.quality.resources_documentation">
              <VIcon name="ri-check-line" /> Ressources documentées
            </span>
            <span v-else>
              <VIcon name="ri-close-circle-line" /> Ressources non documentées
            </span>
          </li>
          <li>
            <span v-if="dataset.quality.license">
              <VIcon name="ri-check-line" /> Licence renseignée
            </span>
            <span v-else>
              <VIcon name="ri-close-circle-line" /> Licence non renseignée
            </span>
          </li>
          <li>
            <span v-if="dataset.quality.update_fulfilled_in_time">
              <VIcon name="ri-check-line" /> Fréquence de mise à jour respectée
            </span>
            <span v-else>
              <VIcon name="ri-close-circle-line" /> Fréquence de mise à jour non
              respectée
            </span>
          </li>
          <li>
            <span v-if="dataset.quality.has_open_format">
              <VIcon name="ri-check-line" /> Formats de fichiers standards
            </span>
            <span v-else>
              <VIcon name="ri-close-circle-line" /> Formats de fichiers non
              standards
            </span>
          </li>
          <li>
            <span v-if="dataset.quality.temporal_coverage">
              <VIcon name="ri-check-line" /> Couverture temporelle renseignée
            </span>
            <span v-else>
              <VIcon name="ri-close-circle-line" /> Couverture temporelle non
              renseignée
            </span>
          </li>
          <li>
            <span v-if="dataset.quality.spatial">
              <VIcon name="ri-check-line" /> Couverture spatiale renseignée
            </span>
            <span v-else>
              <VIcon name="ri-close-circle-line" /> Couverture spatiale non
              renseignée
            </span>
          </li>
        </ul>
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
ul.es__comment__container {
  list-style-type: none;
  padding-inline-start: 0.25rem;
  li {
    padding-bottom: 1.5rem;
  }
}
.es__comment__metadata {
  .es__comment__author {
    font-weight: bold;
  }
}
.es__organization__sidebar {
  text-align: center;
  width: 100%;
  .es__organization__sidebar__metadata_container {
    padding: 0 2rem;
  }
  .es__organization__sidebar__logo_container {
    width: 100%;
    img {
      max-width: 250px;
    }
  }
}
.es__quality {
  list-style-type: none;
  padding-inline-start: 0;
}

.search-bar {
  margin-top: 15px;
}
</style>
