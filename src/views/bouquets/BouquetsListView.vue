<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { capitalize, computed, inject, ref, watch, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import GenericContainer from '@/components/GenericContainer.vue'
import BouquetList from '@/components/bouquets/BouquetList.vue'
import BouquetSearch from '@/components/bouquets/BouquetSearch.vue'
import type { BreadcrumbItem } from '@/model/breadcrumb'
import {
  AccessibilityPropertiesKey,
  type AccessibilityPropertiesType
} from '@/model/injectionKeys'
import { NoOptionSelected } from '@/model/theme'
import { useUserStore } from '@/store/UserStore'
import { useTopicsConf } from '@/utils/config'

const { topicsSlug, topicsName } = useTopicsConf()

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
const bouquetListComp = ref<InstanceType<typeof BouquetList> | null>(null)

const userStore = useUserStore()
const { canAddBouquet } = storeToRefs(userStore)

const setAccessibilityProperties = inject(
  AccessibilityPropertiesKey
) as AccessibilityPropertiesType

const breadcrumbList = computed(() => {
  const links: BreadcrumbItem[] = []
  links.push({ text: 'Accueil', to: '/' })
  links.push({ text: `${capitalize(topicsName)}s`, to: `/${topicsSlug}` })
  if (selectedTheme.value !== NoOptionSelected && selectedTheme.value !== '') {
    links.push({
      text: selectedTheme.value,
      to: `/${topicsSlug}?theme=${selectedTheme.value}&subtheme=${NoOptionSelected}`
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

const createUrl = computed(() => {
  return { name: `${topicsSlug}_add`, query: route.query }
})

const pageTitle = computed(() => {
  if (selectedQuery.value) {
    return `${route.meta.title} pour "${selectedQuery.value}"`
  }
  return route.meta.title
})

const searchResultsMessage = computed(() => {
  return bouquetListComp.value ? bouquetListComp.value.numberOfResultMsg : ''
})

const setLiveResults = () => {
  // only display the number of results if a query or filter exists
  if (route.fullPath !== route.path) {
    setAccessibilityProperties(pageTitle.value, false, [
      {
        text: searchResultsMessage.value
      }
    ])
  } else {
    setAccessibilityProperties(pageTitle.value, false)
  }
}

const search = useDebounceFn(() => {
  router
    .push({
      name: topicsSlug,
      query: { ...route.query, q: selectedQuery.value }
    })
    .then(() => {
      setLiveResults()
    })
}, 600)

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
      <h1 class="fr-col-auto fr-mb-2v">{{ capitalize(topicsName) }}s</h1>
      <div
        v-if="canAddBouquet"
        class="fr-col-auto fr-grid-row fr-grid-row--middle"
      >
        <router-link :to="createUrl" class="fr-btn fr-mb-1w">
          <VIcon name="ri-add-circle-line" class="fr-mr-1v" />
          Ajouter un {{ topicsName }}
        </router-link>
      </div>
    </div>
    <div class="fr-col-md-12 fr-mb-2w">
      <DsfrSearchBar
        v-model="selectedQuery"
        :label="`Rechercher un ${topicsName}`"
        button-text="Rechercher"
        placeholder=""
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
            <h2 id="fr-sidemenu-title" className="fr-sidemenu__title h3">
              Filtres
            </h2>
            <BouquetSearch
              :theme-name="selectedTheme"
              :subtheme-name="selectedSubtheme"
              :geozone="selectedGeozone"
              :show-drafts="showDrafts"
              @vue:updated="setLiveResults"
            />
          </div>
        </nav>
        <div className="fr-col">
          <BouquetList
            ref="bouquetListComp"
            :theme-name="selectedTheme"
            :subtheme-name="selectedSubtheme"
            :show-drafts="showDrafts"
            :geozone="geozone"
            :query="selectedQuery"
            @clear-filters="setLiveResults"
          />
        </div>
      </div>
    </div>
  </GenericContainer>
</template>

<style scoped>
/* put above header (ground+500) so that multiselect floats above menu */
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
