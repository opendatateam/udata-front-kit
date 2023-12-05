<script setup>
import { ResourceAccordion } from '@etalab/data.gouv.fr-components'
import { filesize } from 'filesize'
import { computed, onMounted, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'

import ChartData from '../../components/ChartData.vue'
import Tile from '../../components/Tile.vue'
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
const resources = ref([])
const discussions = ref({})
const discussionsPage = ref(1)
const expandedDiscussion = ref(null)
const selectedTabIndex = ref(0)

onMounted(() => {
  datasetStore.load(datasetId)
})

const chartData = computed(() => {
  if (!dataset.value?.extras) return
  return dataset.value.extras['config:charts']
})

const formatFileSize = (fileSize) => {
  if (!fileSize) return 'Taille inconnue'
  return filesize(fileSize)
}

const files = computed(() => {
  return resources.value?.map((resource) => {
    return {
      title: resource.title || 'Fichier sans nom',
      format: resource.format,
      size: formatFileSize(
        resource.filesize ||
          resource.extras['check:headers:content-length'] ||
          resource.extras['analysis:content-length']
      ),
      href: resource.url
    }
  })
})

const tabs = computed(() => {
  const _tabs = [
    { title: 'Fichiers', tabId: 'tab-0', panelId: 'tab-content-0' },
    { title: 'Réutilisations', tabId: 'tab-1', panelId: 'tab-content-1' },
    { title: 'Discussions', tabId: 'tab-2', panelId: 'tab-content-2' },
    { title: 'Qualité', tabId: 'tab-3', panelId: 'tab-content-3' },
    { title: 'Métadonnées', tabId: 'tab-4', panelId: 'tab-content-4' }
  ]
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

const getType = (type) => {
  return reuseStore.getType('application')
}

// launch reuses and discussions fetch as soon as we have the technical id
watchEffect(async () => {
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
    resources.value = await datasetStore.loadResources(dataset.value.resources)
  } else {
    resources.value = dataset.value.resources
  }
})
</script>

<template>
  <div class="fr-container width-inherit fr-container--fluid fr-mt-4w fr-mb-4w">
    <div class="fr-grid-row">
      <div
        v-if="dataset.organization"
        class="fr-col-md-4 es__organization__sidebar"
      >
        <div class="es__organization__sidebar__logo_container">
          <img :src="dataset.organization.logo" />
        </div>
        <div class="es__organization__sidebar__metadata_container">
          <h6>
            <a href="">{{ dataset.organization.name }}</a>
          </h6>
        </div>
      </div>
      <div class="fr-col-md-8">
        <h1>{{ dataset.title }}</h1>
        <div v-html="description"></div>
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
        v-if="files"
        panel-id="tab-content-0"
        tab-id="tab-0"
        :selected="selectedTabIndex === 0"
      >
        <div class="datagouv-components" v-if="selectedTabIndex === 0">
          <ResourceAccordion
            v-for="resource in dataset.resources"
            :datasetId="datasetId"
            :resource="resource"
          />
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
            <!--<Tile
              :external-link="r.page"
              :title="r.title"
              :description="r.description"
              :img="r.organization?.logo || r.owner.avatar"
            />-->
            <DsfrCard
              class="fr-enlarge-link"
              :link="r.page"
              :style="`max-width: 300px; max-height: 400px`"
              :title="cropString(r.title)"
              no-arrow="true"
              :detail="getType(r.type)"
              :description="reuseDescription(r)"
              size="sm"
              :imgSrc="r.organization?.logo || r.owner.avatar"
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
</style>
