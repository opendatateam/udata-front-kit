<script setup>
import { computed, ref, watchEffect } from "vue"
import { useRoute, onBeforeRouteUpdate } from "vue-router"
import Tile from "../../components/Tile.vue"
import { useSearchStore } from "../../store/SearchStore"
import config from "@/config"

const route = useRoute()
const store = useSearchStore()
const query = computed(() => route.query.q)
const mainTopic = ref(config.universe_topic_id)
const subTopics = ref(config.website__list_topics)
const topic = computed(() => route.query.topic)
let searchTopic = topic.value
const currentPage = ref(1)
const searchFilter = ref([])

const selectedTopic = computed(() => {
  if (searchTopic) {
    return config.website__list_topics.filter(
      (item) => item.id === searchTopic
    )[0].name
  } else {
    return null
  }
})

const datasets = computed(() => store.datasets)
const pages = computed(() => store.pagination)

const topicFacetNames = (config.website__list_topics && config.website__list_topics.length) ?  ["Toutes les données"].concat(config.website__list_topics.map((item) => item.name)) : null


const filterSearch = (filterKey, filterValue) => {
  if (!filterValue) return
  searchFilter.value = [`${filterKey} = "${filterValue}"`]
}

const onSelectTopic = (value) => {
  selectedTopic.value = value
  let newTopic = null
  if (value != "Toutes les données") {
    newTopic = config.website__list_topics.filter(
      (item) => item.name === value
    )[0].id
  }
  currentPage.value = 1
  searchTopic = newTopic
  store.search(query.value, searchTopic, currentPage.value, searchFilter.value)
}

const resetFilter = () => {
  searchFilter.value = []
}

// reset currentPage when query changes
onBeforeRouteUpdate((to, from) => {
  currentPage.value = 1
  resetFilter()
})

watchEffect(() => {
  store.search(query.value, searchTopic, currentPage.value, searchFilter.value)
})
</script>

<template>
  <div class="fr-container--fluid fr-mt-4w fr-mb-4w">
    <h2 v-if="query">Résultats de recherche pour "{{ query }}"</h2>
    <h2 v-else>Jeux de données</h2>
    <div class="fr-mb-4w" v-if="query && datasets?.length === 0">
      Aucun résultat pour cette recherche.
    </div>
    <div class="fr-grid-row">
      <div v-if="topicFacetNames" class="fr-col-md-3 fr-pr-md-2w fr-mb-2w">
        <DsfrSelect
          :options="topicFacetNames"
          :model-value="selectedTopic"
          @update:modelValue="onSelectTopic"
          v-if="subTopics"
        >
          <template #label>Thématiques</template>
        </DsfrSelect>
      </div>
      <div :class="[topicFacetNames ? 'fr-col-md-9' : 'fr-col-md-12']">
        <ul class="fr-grid-row fr-grid-row--gutters es__tiles__list">
          <li v-for="d in datasets" class="fr-col-12 fr-col-lg-4">
            <span v-if="d.organization && d.organization.logo">
              <Tile
                :link="`/datasets/${d.slug}`"
                :title="d.title"
                :description="d.description"
                :img="d.organization.logo"
              />
            </span>
            <span v-else>
              <Tile
                :link="`/datasets/${d.slug}`"
                :title="d.title"
                :description="d.description"
                :img="null"
              />
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
  <DsfrPagination
    v-if="pages.length"
    :current-page="currentPage - 1"
    :pages="pages"
    @update:current-page="(p) => (currentPage = p + 1)"
  />
</template>
