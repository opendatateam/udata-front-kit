<script setup>
import { marked } from "marked"
import { filesize } from "filesize"

import { computed, onMounted, ref, watch } from "vue"
import { useRoute } from "vue-router"

import { useDatasetStore } from "../../store/DatasetStore"
import { useReuseStore } from "../../store/ReuseStore"
import { useDiscussionStore } from "../../store/DiscussionStore"
import Card from "../../components/Card.vue"

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

const formatFileSize = (fileSize) => {
  if (!fileSize) return "Taille inconnue"
  return filesize(fileSize)
}

const files = computed(() => {
  return dataset.value?.resources?.map(resource => {
    return {
      title: resource.title || "Fichier sans nom",
      format: resource.format,
      size: formatFileSize(resource.filesize),
      href: resource.url,
    }
  })
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
  <h1>{{ dataset.title }}</h1>
  <div v-html="description"></div>
  <DsfrFileDownloadList
    class="fr-mt-4w"
    :files="files"
    title="Fichiers du jeu de données"
  />

  <h2 class="fr-mt-4w">Réutilisations</h2>
  <div v-if="!reuses.length">Pas de réutilisation pour ce jeu de données.</div>
  <div class="fr-grid-row fr-grid-row--gutters">
    <Card v-for="r in reuses"
      class="fr-card--horizontal fr-card--sm fr-col-5 fr-m-2w"
      type="dataset"
      :alt-img="r.title"
      :external-link="r.page"
      :title="r.title"
      :description="r.description"
      :img="r.organization?.logo || r.owner.avatar"
    />
  </div>

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
</template>

<style scoped lang="scss">
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
</style>
