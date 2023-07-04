<script setup>
import { computed, onMounted, watch } from "vue"
import { useRoute } from "vue-router"
import Card from "../../components/Card.vue"
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
    <div class="fr-grid-row fr-grid-row--gutters">
      <Card v-for="d in datasets"
        class="fr-card--horizontal fr-card--sm fr-col-5 fr-m-2w"
        type="dataset"
        :alt-img="d.title"
        :link="`/datasets/${d.slug}`"
        :title="d.title"
        :description="d.description"
        :img="d.organization.logo"
      />
    </div>
  </div>
</template>
