<script setup lang="ts">
import { ref, computed, watch, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import GenericContainer from '@/components/GenericContainer.vue'
import BouquetList from '@/custom/ecospheres/components/BouquetList.vue'
import BouquetSearch from '@/custom/ecospheres/components/BouquetSearch.vue'
import type { BreadcrumbItem } from '@/model/breadcrumb'
import { NoOptionSelected } from '@/model/theme'

const router = useRouter()
const route = useRoute()

const props = defineProps({
  query: {
    type: String,
    default: ''
  },
  theme: {
    type: String,
    default: NoOptionSelected
  },
  subtheme: {
    type: String,
    default: NoOptionSelected
  },
  geozone: {
    type: String,
    default: null
  },
  drafts: {
    type: String,
    default: null
  }
})

const selectedTheme = ref(NoOptionSelected)
const selectedSubtheme = ref(NoOptionSelected)
const selectedGeozone: Ref<string | null> = ref(null)
const selectedQuery = ref('')
const showDrafts = ref(false)

const breadcrumbList = computed(() => {
  const links: BreadcrumbItem[] = []
  links.push({ text: 'Accueil', to: '/' })
  links.push({ text: 'Bouquets', to: '/bouquets' })
  if (selectedTheme.value !== NoOptionSelected && selectedTheme.value !== '') {
    links.push({
      text: selectedTheme.value,
      to: `/bouquets?theme=${selectedTheme.value}&subtheme=${NoOptionSelected}`
    })
    if (
      selectedSubtheme.value !== NoOptionSelected &&
      selectedSubtheme.value !== ''
    ) {
      links.push({ text: selectedSubtheme.value })
    }
  }
  return links
})

const goToCreate = () => {
  router.push({ name: 'bouquet_add', query: route.query })
}

const search = () => {
  router.push({
    name: 'bouquets',
    query: { ...route.query, q: selectedQuery.value },
    hash: '#main'
  })
}

watch(
  props,
  () => {
    selectedTheme.value = props.theme
    selectedSubtheme.value = props.subtheme
    selectedGeozone.value = props.geozone
    selectedQuery.value = props.query
    showDrafts.value = props.drafts === '1'
  },
  { immediate: true }
)
</script>

<template>
  <div class="fr-container">
    <DsfrBreadcrumb class="fr-mb-1v" :links="breadcrumbList" />
  </div>
  <GenericContainer>
    <div
      class="fr-grid-row fr-grid-row--gutters fr-grid-row--middle justify-between fr-pb-1w"
    >
      <h1 class="fr-col-auto fr-mb-2v">Bouquets</h1>
      <div class="fr-col-auto fr-grid-row fr-grid-row--middle">
        <DsfrButton
          class="fr-mb-1w"
          label="Ajouter un bouquet"
          icon="ri-add-circle-line"
          @click="goToCreate"
        />
      </div>
    </div>
    <div class="fr-col-md-12 fr-mb-2w">
      <DsfrSearchBar
        v-model="selectedQuery"
        label="Rechercher"
        placeholder="Rechercher un bouquet"
        @update:model-value="search"
      />
    </div>
    <div class="fr-mt-2w">
      <div className="fr-grid-row">
        <nav
          className="fr-sidemenu fr-col-md-4"
          aria-labelledby="fr-sidemenu-title"
        >
          <div className="fr-sidemenu__inner">
            <div id="fr-sidemenu-title" className="fr-sidemenu__title">
              Filtres
            </div>
            <BouquetSearch
              :theme-name="selectedTheme"
              :subtheme-name="selectedSubtheme"
              :geozone="selectedGeozone"
              :show-drafts="showDrafts"
            />
          </div>
        </nav>
        <div className="fr-col">
          <BouquetList
            :theme-name="selectedTheme"
            :subtheme-name="selectedSubtheme"
            :show-drafts="showDrafts"
            :geozone="geozone"
            :query="selectedQuery"
          />
        </div>
      </div>
    </div>
  </GenericContainer>
</template>

<style scoped="true" lang="scss">
// put above header (ground+500) so that multiselect floats above menu
.fr-sidemenu {
  z-index: calc(var(--ground) + 600);
}

@media (max-width: 768px) {
  .fr-sidemenu {
    margin-left: 0;
    margin-right: 0;
    margin-bottom: 2em;
    width: 100%;
    .fr-sidemenu__title {
      box-shadow: none;
    }
  }
}
</style>
