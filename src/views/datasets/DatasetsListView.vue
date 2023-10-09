<script setup>
import { computed, ref, watchEffect } from "vue"
import { useRoute, onBeforeRouteUpdate } from "vue-router"
import { useSearchStore } from "../../store/SearchStore"
import Tile from "../../components/Tile.vue"

const route = useRoute()
const store = useSearchStore()
const query = computed(() => route.query.q)
const currentPage = ref(1)

const datasets = computed(() => store.datasets)
const pages = computed(() => store.pagination)

// reset currentPage when query changes
onBeforeRouteUpdate((to, from) => {
  currentPage.value = 1
})

watchEffect(() => {
  store.search(query.value, currentPage.value)
})
</script>

<template>
  <div class="fr-container--fluid fr-mt-4w fr-mb-4w">
    <h2 v-if="query">Résultats de recherche pour "{{ query }}"</h2>
    <h2 v-else>Jeux de données</h2>
    <div class="fr-mb-4w" v-if="query && datasets?.length === 0">Aucun résultat pour cette recherche.</div>
    <ul class="fr-grid-row fr-grid-row--gutters es__tiles__list">
      <li v-for="d in datasets" class="fr-col-12 fr-col-lg-4">
        <Tile
          :link="`/datasets/${d.slug}`"
          :title="d.title"
          :description="d.description"
          :img="d.organization.logo"
          :is-markdown="true"
        />
      </li>
    </ul>
  </div>
  <DsfrPagination v-if="pages.length" :current-page="currentPage - 1" :pages="pages" @update:current-page="p => currentPage = p + 1" />
</template>
