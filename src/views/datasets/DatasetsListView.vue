<script setup>
import { AppLink, DatasetCard } from '@etalab/data.gouv.fr-components'
import { computed, onMounted, ref, watchEffect } from 'vue'
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
  try {
    const url = router.resolve({
      name: 'organization_detail',
      params: { oid: id }
    })
    return url.href
  } catch (e) {
    return ''
  }
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
  store.search(query.value, selectedTopicId.value, currentPage.value)
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

    <div v-if="topicsConf" class="fr-col-md-12 fr-pr-md-2w fr-mb-2w">
      <DsfrSelect
        :model-value="selectedTopicId"
        :options="topicOptions"
        default-unselected-text="Toutes les données"
        @update:modelValue="onSelectTopic"
      >
        <template #label>Thématiques</template>
      </DsfrSelect>
    </div>
    <div class="datagouv-components fr-col-md-12">
      <DatasetCard
        v-for="(d, index) in datasets"
        :style="zIndex(index)"
        :dataset="d"
        :datasetUrl="getDatasetPage(d.id)"
        :organizationUrl="getOrganizationPage(d.organization.id)"
      >
        <template #datasetUrl="{ dataset, datasetUrl }">
          <AppLink :to="datasetUrl" class="text-grey-500">
            {{ dataset.title }}
            <small v-if="dataset.acronym">{{ dataset.acronym }}</small>
          </AppLink>
        </template>
      </DatasetCard>
    </div>
  </div>
  <DsfrPagination
    class="fr-container"
    v-if="pages.length"
    :current-page="currentPage - 1"
    :pages="pages"
    @update:current-page="(p) => (currentPage = p + 1)"
  />
</template>
