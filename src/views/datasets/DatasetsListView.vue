<script setup lang="ts">
import { DatasetCard } from '@etalab/data.gouv.fr-components'
import debounce from 'lodash/debounce'
import { computed, onMounted, ref, watch, type Ref } from 'vue'
import { useLoading } from 'vue-loading-overlay'
import { useRouter } from 'vue-router'

import config from '@/config'
import type { TopicConf } from '@/model/config'
import { useOrganizationStore } from '@/store/OrganizationStore'
import { useSearchStore } from '@/store/SearchStore'
import { useTopicStore } from '@/store/TopicStore'

defineEmits(['search'])
const props = defineProps({
  query: {
    type: String,
    default: null
  },
  page: {
    type: String,
    default: null
  },
  organization: {
    type: String,
    default: null
  },
  topic: {
    type: String,
    default: null
  }
})

const router = useRouter()
const store = useSearchStore()
const currentPage = ref(1)
const localQuery = ref()
const loader = useLoading()

const topicStore = useTopicStore()

const selectedTopicId: Ref<string | null> = ref(null)
const selectedOrganizationId: Ref<string | null> = ref(null)

const datasets = computed(() => store.datasets)
const pages = computed(() => store.pagination)

const title = config.website.title
const topicsConf = config.website.list_highlighted_topics as TopicConf[]
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

const computeUrlQuery = (
  data: Record<string, string | number>
): Record<string, string | number> => {
  return {
    page: currentPage.value,
    ...(localQuery.value && { q: localQuery.value }),
    ...(selectedOrganizationId.value && {
      organization: selectedOrganizationId.value
    }),
    ...(selectedTopicId.value && { topic: selectedTopicId.value }),
    ...data
  }
}

const onSelectTopic = (topicId: string) => {
  router.push({
    path: '/datasets',
    query: computeUrlQuery({
      page: 1,
      topic: topicId
    })
  })
}

const onSelectOrganization = (orgId: string) => {
  router.push({
    path: '/datasets',
    query: computeUrlQuery({
      page: 1,
      organization: orgId
    })
  })
}

const search = () => {
  router.push({ path: '/datasets', query: computeUrlQuery({ page: 1 }) })
}

const goToPage = (page: number) => {
  router.push({ path: '/datasets', query: computeUrlQuery({ page: page + 1 }) })
}

const zIndex = (key: number) => {
  return { zIndex: datasets.value.length - key }
}

const getDatasetPage = (id: string) => {
  return { name: 'dataset_detail', params: { did: id } }
}

const getOrganizationPage = (id: string) => {
  if (router.hasRoute('organization_detail')) {
    return { name: 'organization_detail', params: { oid: id } }
  }
  return ''
}

watch(
  props,
  () => {
    localQuery.value = props.query
    currentPage.value = props.page ? parseInt(props.page) : 1
    selectedOrganizationId.value = props.organization
    selectedTopicId.value = props.topic
  },
  { immediate: true }
)

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
  [localQuery, selectedTopicId, selectedOrganizationId, currentPage],
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
        v-model="localQuery"
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
    @update:current-page="goToPage"
  />
</template>
