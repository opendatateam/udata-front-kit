<script setup>
import { computed, onMounted, watch } from "vue"
import { useRoute } from "vue-router"
import Tile from "../../components/Tile.vue"
import { useSearchStore } from "../../store/SearchStore"

const route = useRoute()
const store = useSearchStore()
const query = computed(() => route.query.q)

const datasets = computed(() => store.$state.data.hits)

watch(query, _query => {
  store.search(_query)
})

onMounted(() => {
  store.search(query.value)
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
        />
      </li>
    </ul>
  </div>
</template>
