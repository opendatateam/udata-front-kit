<script setup>
import { DatasetCard } from '@etalab/data.gouv.fr-components'
import debounce from 'lodash/debounce'
import { computed, onMounted, ref, watchEffect, watch } from 'vue'
import { useLoading } from 'vue-loading-overlay'
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router'

import config from '@/config'
import { fromMarkdown } from '@/utils/index'

import { useSearchStore } from '../../store/SearchStore'
import { useTopicStore } from '../../store/TopicStore'

const route = useRoute()
const router = useRouter()
const store = useSearchStore()
const originalQuery = computed(() => route.query.q)
const currentPage = ref(1)
const query = ref()
const loader = useLoading()
const topicStore = useTopicStore()
const topic = computed(() => route.query.topic)
const selectedTopicId = ref(null)
const datasets = computed(() => store.datasets)
const pages = computed(() => store.pagination)
const title = config.website.title
const topicsConf = config.website.list_highlighted_topics
const topicsData = computed(() => {
  return topicStore.$state.data
})
const topicOptions = computed(() => {
  if (!topicsConf?.length) return
  const topics = topicStore.$state.data
    .filter((t) => {
      return topicsConf.map((st) => st.id).includes(t.id)
    })
    .map((t) => {
      return { value: t.id, text: t.name }
    })
  return [{ value: '', text: 'Toutes les données' }, ...topics]
})
const links = [{ to: '/', text: 'Accueil' }, { text: 'Défis' }]
const onSelectTopic = (topicId) => {
  selectedTopicId.value = topicId
  currentPage.value = 1
}
const search = () => {
  router.push({ path: '/topics', query: { q: query.value } })
}
const zIndex = (key) => {
  return { zIndex: datasets.value.length - key }
}
// reset currentPage when query changes
onBeforeRouteUpdate((to, from) => {
  currentPage.value = 1
})
const getDatasetPage = (id) => {
  return { name: 'dataset_detail', params: { did: id } }
}
const getOrganizationPage = (id) => {
  if (router.hasRoute('organization_detail')) {
    return { name: 'organization_detail', params: { oid: id } }
  }
  return ''
}
onMounted(() => {
  if (topicsConf?.length) {
    topicStore.loadTopicsFromList(topicsConf)
  }
  query.value = originalQuery.value
})
// fill topic name when arriving on the page with a topic ID
// TODO: topicId is not updated when selecting a topic
watchEffect(() => {
  if (!topic.value || !topicsConf) return
  selectedTopicId.value = topic.value
})
watchEffect(() => {
  if (!originalQuery.value) return
  query.value = originalQuery.value
})
const delayedSearch = debounce(
  (currentQuery, currentTopicId, currentPageValue) => {
    const loadingInstance = loader.show()
    store.search(currentQuery, currentTopicId, currentPageValue).finally(() => {
      loadingInstance.hide()
    })
  },
  400
)
watch(
  [query, selectedTopicId, currentPage],
  ([currentQuery, currentTopicId, currentPageValue]) => {
    delayedSearch(currentQuery, currentTopicId, currentPageValue)
  },
  {
    immediate: true
  }
)
</script>
<template>
  <div class="fr-container">
    <DsfrBreadcrumb class="fr-mb-1v" :links="links" />
  </div>
  <div class="fr-container fr-mb-4w">
    <h1 class="fr-mb-2v">Défis</h1>
    <div v-if="topicsConf" class="fr-col-md-12 fr-mb-2w">
      <DsfrSelect
        :model-value="selectedTopicId"
        :options="topicOptions"
        default-unselected-text="Toutes les données"
        @update:model-value="onSelectTopic"
      >
        <template #label>Sélectionner un autre défi</template>
      </DsfrSelect>
    </div>
    <div v-for="topic in topicsData" v-bind:key="topic.id">
      <template v-if="topic.id == selectedTopicId">
        <br />
        <h2>{{ topic.name }}</h2>
        <div v-html="fromMarkdown(topic.description)"></div>
        <div class="datagouv-components fr-col-md-12">
          <DatasetCard
            v-for="(d, index) in datasets"
            :key="d.id"
            :style="zIndex(index)"
            :dataset="d"
            :dataset-url="getDatasetPage(d.id)"
            :organization-url="getOrganizationPage(d.organization.id)"
          />
        </div>
      </template>
    </div>
  </div>
  <DsfrPagination
    v-if="pages.length"
    class="fr-container"
    :current-page="currentPage - 1"
    :pages="pages"
    @update:current-page="(p) => (currentPage = p + 1)"
  />
</template>
