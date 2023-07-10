<script setup>
import { marked } from "marked"
import { filesize } from "filesize"

import { computed, onMounted, ref, watch } from "vue"
import { useRoute } from "vue-router"

import { useDatasetStore } from "../../store/DatasetStore"
import { useReuseStore } from "../../store/ReuseStore"
import { useDiscussionStore } from "../../store/DiscussionStore"
import Tile from "../../components/Tile.vue"

const route = useRoute()
const datasetId = route.params.did

const datasetStore = useDatasetStore()
const reuseStore = useReuseStore()
const discussionStore = useDiscussionStore()

const dataset = computed(() => datasetStore.get(datasetId) || {})
const discussionsPages = ref([])
const reuses = ref([])
const discussions = ref({})
const discussionsPage = ref(1)
const expandedDiscussion = ref(null)
const selectedTabIndex = ref(0)
const sizes = ref({})

const formatFileSize = (fileSize) => {
  if (!fileSize) return "Taille inconnue"
  return filesize(fileSize)
}

const files = computed(() => {
  return dataset.value?.resources?.map(resource => {
    return {
      title: resource.title || "Fichier sans nom",
      format: resource.format,
      size: formatFileSize(resource.filesize || resource.extras["check:headers:content-length"] || resource.extras["analysis:content-length"]),
      href: resource.url,
    }
  })
})

const tabs = computed(() => {
  // FIXME: incluse sizes while fixing reactivity
  return [
    {"title": "Fichiers", "tabId":"tab-0", "panelId":"tab-content-0"},
    {"title": "Réutilisations", "tabId":"tab-1", "panelId":"tab-content-1"},
    {"title": "Discussions", "tabId":"tab-2", "panelId":"tab-content-2"},
    {"title": "Métadonnées", "tabId":"tab-3", "panelId":"tab-content-3"},
  ]
})

const description = computed(() => {
  if (dataset.value?.description) {
    return marked.parse(dataset.value.description, {mangle: false, headerIds: false})
  }
})

const onUpdatePage = (page) => {
  discussionsPage.value = page + 1
  discussionStore.loadDiscussionsForDataset(dataset.value.id, discussionsPage.value).then((d) => discussions.value = d)
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("default", {dateStyle: "full", timeStyle: "short"}).format(date)
}

watch([reuses, files, discussions], ([r, f, d]) => {
  sizes.value = {
    reuses: r.length,
    files: f.length,
    discussions: d.total,
  }
})

// launch reuses and discussions fetch as soon as we have the technical id
watch(dataset, _dataset => {
  if (_dataset?.id) {
    reuseStore.loadReusesForDataset(_dataset.id).then((r) => reuses.value = r)
    discussionStore.loadDiscussionsForDataset(_dataset.id).then((d) => {
      discussions.value = d
      discussionsPages.value = discussionStore.getDiscussionsPaginationForDataset(_dataset.id)
    })
  }
})

onMounted(() => {
  datasetStore.load(datasetId)
})
</script>

<template>
  <div class="fr-container--fluid fr-mt-4w fr-mb-4w">
    <div class="fr-grid-row">
      <div class="fr-col-md-4 es__organization__sidebar" v-if="dataset.organization">
        <div class="es__organization__sidebar__logo_container">
          <img :src="dataset.organization.logo">
        </div>
        <div class="es__organization__sidebar__metadata_container">
          <h6><a href="">{{ dataset.organization.name }}</a></h6>
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
      @select-tab="(idx) => selectedTabIndex = idx"
    >
      <!-- Fichiers -->
      <DsfrTabContent
        panel-id="tab-content-0"
        tab-id="tab-0"
        :selected="selectedTabIndex === 0"
      >
        <DsfrFileDownloadList
            class="fr-mt-4w"
            :files="files"
            title="Fichiers du jeu de données"
          />
      </DsfrTabContent>

      <!-- Réutilisations -->
      <DsfrTabContent
        panel-id="tab-content-1"
        tab-id="tab-1"
        :selected="selectedTabIndex === 1"
      >
        <h2 class="fr-mt-4w">Réutilisations</h2>
        <div v-if="!reuses.length">Pas de réutilisation pour ce jeu de données.</div>
        <ul v-else class="fr-grid-row fr-grid-row--gutters es__tiles__list">
          <li v-for="r in reuses" class="fr-col-12 fr-col-lg-6">
            <Tile
              :external-link="r.page"
              :title="r.title"
              :description="r.description"
              :img="r.organization?.logo || r.owner.avatar"
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
        <div v-if="!discussions.data?.length">Pas de discussion pour ce jeu de données.</div>
        <DsfrAccordionsGroup>
          <li v-for="discussion in discussions.data">
            <DsfrAccordion :id="discussion.id" :title="discussion.title" :expanded-id="expandedDiscussion" @expand="id => expandedDiscussion = id">
              <template #default>
                <ul class="es__comment__container">
                  <li v-for="comment in discussion.discussion">
                    <div class="es__comment__metadata fr-mb-1v">
                      <span class="es__comment__author">{{ comment.posted_by.first_name }} {{ comment.posted_by.last_name }}</span>
                      <span class="es__comment__date fr-ml-1v">le {{ formatDate(comment.posted_on) }}</span>
                    </div>
                    <div class="es__comment__content">{{ comment.content }}</div>
                  </li>
                </ul>
              </template>
            </DsfrAccordion>
          </li>
        </DsfrAccordionsGroup>
        <DsfrPagination class="fr-mt-2w" v-if="discussionsPages.length" :current-page="discussionsPage - 1" :pages="discussionsPages" @update:current-page="onUpdatePage" />
      </DsfrTabContent>

      <!-- Métadonnées -->
      <DsfrTabContent
        panel-id="tab-content-3"
        tab-id="tab-3"
        :selected="selectedTabIndex === 3"
      >
        <pre>{{ dataset }}</pre>
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
</style>
