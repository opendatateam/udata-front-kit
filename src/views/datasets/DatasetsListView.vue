<script setup>
import { computed, ref, watchEffect } from "vue";
import { useRoute, onBeforeRouteUpdate } from "vue-router";
import { useSearchStore } from "../../store/SearchStore";
import Tile from "../../components/Tile.vue";

const route = useRoute();
const store = useSearchStore();
const query = computed(() => route.query.q);
const currentPage = ref(1);
const searchFilter = ref([]);
const selectedOrg = ref(null);

const datasets = computed(() => store.datasets);
const pages = computed(() => store.pagination);

const orgFacets = computed(() => {
  return Object.keys(store.facets["organization.name"] || {})
    .map((k) => {
      const count = store.facets["organization.name"][k];
      return {
        text: `${k} (${count})`,
        value: k,
      };
    })
    .sort((a, b) => a.value - b.value);
});

const filterSearch = (filterKey, filterValue) => {
  if (!filterValue) return;
  searchFilter.value = [`${filterKey} = "${filterValue}"`];
};

const onSelectOrg = (value) => {
  selectedOrg.value = value;
  filterSearch("organization.name", value);
};

const resetFilter = () => {
  searchFilter.value = [];
  selectedOrg.value = null;
};

// reset currentPage when query changes
onBeforeRouteUpdate((to, from) => {
  currentPage.value = 1;
  resetFilter();
});

watchEffect(() => {
  store.search(query.value, currentPage.value, searchFilter.value);
});
</script>

<template>
  <div class="fr-container--fluid fr-mt-4w fr-mb-4w">
    <h2 v-if="query">Résultats de recherche pour "{{ query }}"</h2>
    <h2 v-else>Jeux de données</h2>
    <div v-if="query && datasets?.length === 0" class="fr-mb-4w">
      Aucun résultat pour cette recherche.
    </div>
    <div class="fr-grid-row">
      <div class="fr-col-md-4 fr-pr-md-2w fr-mb-2w">
        <div class="fr-mb-2w">
          <a v-if="selectedOrg" href="#" :click.prevent.stop="resetFilter"
            >x Effacer les filtres</a
          >
        </div>
        <DsfrSelect
          :options="orgFacets"
          :model-value="selectedOrg"
          @update:modelValue="onSelectOrg"
        >
          <template #label>Organisation</template>
        </DsfrSelect>
      </div>
      <div class="fr-col-md-8">
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
    </div>
  </div>
  <DsfrPagination
    v-if="pages.length"
    :current-page="currentPage - 1"
    :pages="pages"
    @update:current-page="(p) => (currentPage = p + 1)"
  />
</template>
