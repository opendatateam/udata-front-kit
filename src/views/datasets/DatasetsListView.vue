<script setup>
import { DatasetCard } from '@etalab/data.gouv.fr-components'
import debounce from 'lodash/debounce'
import { computed, onMounted, ref, watchEffect, watch } from 'vue'
import { useLoading } from 'vue-loading-overlay'
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router'

import config from '@/config'
import { useOrganizationStore } from '@/store/OrganizationStore'
import { useSearchStore } from '@/store/SearchStore'
import { useTopicStore } from '@/store/TopicStore'

defineEmits(['search'])

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
const selectedOrganizationId = ref(null)

const datasets = computed(() => store.datasets)
const pages = computed(() => store.pagination)

const title = config.website.title
const topicsConf = config.website.list_highlighted_topics
const hasOrganizationFilter = config.website.datasets.organization_filter

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

const organizationOptions = computed(() => [
  { value: '', text: 'Toutes les organisations' },
  ...useOrganizationStore().flatData.map((org) => {
    return { value: org.id, text: org.name }
  })
])

const links = [{ to: '/', text: 'Accueil' }, { text: 'Données' }]

const onSelectTopic = (topicId) => {
  selectedTopicId.value = topicId
  currentPage.value = 1
}

const onSelectOrganization = (orgId) => {
  selectedOrganizationId.value = orgId
  currentPage.value = 1
}

const search = () => {
  router.push({ path: '/datasets', query: { q: query.value } })
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
  (currentQuery, currentTopicId, currentOrganizationId, currentPageValue) => {
    const loadingInstance = loader.show()
    const args = currentOrganizationId
      ? { organization: currentOrganizationId }
      : {}
    store
      .search(currentQuery, currentTopicId, currentPageValue, args)
      .finally(() => {
        loadingInstance.hide()
      })
  },
  400
)

watch(
  [query, selectedTopicId, selectedOrganizationId, currentPage],
  ([currentQuery, currentTopicId, currentOrganizationId, currentPageValue]) => {
    delayedSearch(
      currentQuery,
      currentTopicId,
      currentOrganizationId,
      currentPageValue
    )
  },
  {
    immediate: true
  }
)

onMounted(() => {
  if (topicsConf?.length) {
    topicStore.loadTopicsFromList(topicsConf)
  }
  if (hasOrganizationFilter) {
    useOrganizationStore().loadFromConfigFlat()
  }
  query.value = originalQuery.value
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
    <div class="fr-col-md-12 fr-mb-2w">
      <DsfrSearchBar
        v-model="query"
        label="Recherche"
        placeholder="Rechercher des données"
        @update:model-value="search()"
        @search="$emit('search', $event)"
      />
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
    <div v-if="hasOrganizationFilter" class="fr-col-md-12 fr-mb-2w">
      <DsfrSelect
        :model-value="selectedOrganizationId"
        :options="organizationOptions"
        default-unselected-text="Toutes les organisations"
        @update:model-value="onSelectOrganization"
      >
        <template #label>Filtrer par organisation</template>
      </DsfrSelect>
    </div>
    <div v-if="datasets?.length === 0" class="fr-mb-4w">
      Aucun résultat pour cette recherche.
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
