<script setup>
import { computed, ref, watchEffect } from "vue"
import { useRoute, onBeforeRouteUpdate } from "vue-router"
import { useSearchStore } from "../../store/SearchStore"
import Tile from "../../components/Tile.vue"
import config from "@/config"

const route = useRoute()
const store = useSearchStore()
const query = computed(() => route.query.q)
const topic = computed(() => route.query.topic)
// TODO: this should be handled as reactive value instead
let searchTopicId = topic.value
const searchTopicName = ref("")
const currentPage = ref(1)

const subTopics = config.website.list_highlighted_topics

const ALL_DATA_LABEL = "Toutes les données"

const datasets = computed(() => store.datasets)
const pages = computed(() => store.pagination)

// TODO: this should be a filtered reactive subset of TopicStore
// storing both the id and the name
const topicFacetNames = (config.website.list_highlighted_topics?.length)
  ?  [ALL_DATA_LABEL].concat(config.website.list_highlighted_topics.map((item) => item.name))
  : null

const onSelectTopic = (value) => {
  let newTopic = null
  if (value != ALL_DATA_LABEL) {
    newTopic = config.website.list_highlighted_topics.filter(
      (item) => item.name === value
    )[0].id
  }
  currentPage.value = 1
  searchTopicId = newTopic
  store.search(query.value, searchTopicId, currentPage.value)
}

// reset currentPage when query changes
onBeforeRouteUpdate((to, from) => {
  currentPage.value = 1
})

// fill topic name when arriving on the page with a topic ID
// TODO: topic id is not synced in the URL when selecting a topic
watchEffect(() => {
  if (!topic.value || !config.website.list_highlighted_topics) return
  searchTopicName.value = config.website.list_highlighted_topics.find(t => t.id === topic.value).name
})

watchEffect(() => {
  store.search(query.value, searchTopicId, currentPage.value)
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
          :model-value="searchTopicName"
          :options="topicFacetNames"
          @update:modelValue="onSelectTopic"
          v-if="subTopics"
        >
          <template #label>Thématiques</template>
        </DsfrSelect>
      </div>
      <div :class="[topicFacetNames ? 'fr-col-md-9' : 'fr-col-md-12']">
        <ul class="fr-grid-row fr-grid-row--gutters es__tiles__list">
          <li v-for="d in datasets" class="fr-col-12 fr-col-lg-4">
            <Tile
              :link="`/datasets/${d.slug}`"
              :title="d.title"
              :description="d.description"
              :img="d.organization?.logo"
              :is-markdown="true"
            />
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
