<script setup>
import { DatasetCard } from '@etalab/data.gouv.fr-components'
import { computed, onMounted, ref, watchEffect } from 'vue'
import { useLoading } from 'vue-loading-overlay'
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router'

import config from '@/config'

import { useSearchStore } from '../../store/SearchStore'
import { useTopicStore } from '../../store/TopicStore'

const route = useRoute()
const router = useRouter()
const store = useSearchStore()
const query = computed(() => route.query.q)
const currentPage = ref(1)

const topicStore = useTopicStore()
const topic = computed(() => route.query.topic)
const selectedTopicId = ref(null)

const datasets = computed(() => store.datasets)
const pages = computed(() => store.pagination)

const title = config.website.title
const topicsConf = config.website.list_highlighted_topics
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

const links = [{ to: '/', text: 'Accueil' }, { text: 'Données' }]

const onSelectTopic = (topicId) => {
  selectedTopicId.value = topicId
  currentPage.value = 1
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
})

// fill topic name when arriving on the page with a topic ID
// TODO: topicId is not updated when selecting a topic
watchEffect(() => {
  if (!topic.value || !topicsConf) return
  selectedTopicId.value = topic.value
})

watchEffect(() => {
  const loader = useLoading().show()
  store
    .search(query.value, selectedTopicId.value, currentPage.value)
    .finally(() => loader.hide())
})
</script>

<template>
  <div class="fr-container">
    <DsfrBreadcrumb class="fr-mb-1v" :links="links" />
  </div>
  <div class="fr-container fr-mb-4w">
    <h1 class="fr-mb-2v">Jeux de données</h1>
    <p v-if="query">Résultats de recherche pour "{{ query }}".</p>
    <p v-else>Parcourir tous les jeux de données présents sur {{ title }}.</p>
    <div v-if="query && datasets?.length === 0" class="fr-mb-4w">
      Aucun résultat pour cette recherche.
    </div>

    <div v-if="topicsConf" class="fr-col-md-12 fr-mb-2w">
      <DsfrSelect
        :model-value="selectedTopicId"
        :options="topicOptions"
        default-unselected-text="Toutes les données"
        @update:model-value="onSelectTopic"
      >
        <template #label>Thématiques</template>
      </DsfrSelect>
    </div>
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
  </div>
  <DsfrPagination
    v-if="pages.length"
    class="fr-container"
    :current-page="currentPage - 1"
    :pages="pages"
    @update:current-page="(p) => (currentPage = p + 1)"
  />
</template>
