<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import { computed, inject, ref, watch, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import GenericContainer from '@/components/GenericContainer.vue'
import type { BreadcrumbItem } from '@/model/breadcrumb'
import {
  AccessibilityPropertiesKey,
  type AccessibilityPropertiesType
} from '@/model/injectionKeys'
import IndicatorList from '../../components/indicators/IndicatorList.vue'

const router = useRouter()
const route = useRoute()

const props = defineProps({
  query: {
    type: String,
    default: ''
  },
  theme: {
    type: String,
    default: null
  },
  geozone: {
    type: String,
    default: null
  }
})

const selectedTheme: Ref<string | null> = ref(null)
const selectedGeozone: Ref<string | null> = ref(null)
const selectedQuery = ref('')
const indicatorListComp = ref<InstanceType<typeof IndicatorList> | null>(null)

/* a11y start */

const setAccessibilityProperties = inject(
  AccessibilityPropertiesKey
) as AccessibilityPropertiesType

const breadcrumbList = computed(() => {
  const links: BreadcrumbItem[] = []
  links.push({ text: 'Accueil', to: { name: 'home' } })
  links.push({ text: 'Indicateurs', to: { name: 'indicators' } })
  return links
})

const pageTitle = computed(() => {
  if (selectedQuery.value) {
    return `${route.meta.title} pour "${selectedQuery.value}"`
  }
  return route.meta.title
})

const searchResultsMessage = computed(() => {
  return indicatorListComp.value
    ? indicatorListComp.value.numberOfResultMsg
    : ''
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

/* a11y end */

const search = useDebounceFn(() => {
  router
    .push({
      name: 'indicators',
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
    selectedGeozone.value = props.geozone
    selectedQuery.value = props.query
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
      <h1 class="fr-col-auto fr-mb-2v">Indicateurs</h1>
    </div>
    <div class="fr-col-md-12 fr-mb-2w">
      <DsfrSearchBar
        v-model="selectedQuery"
        label="Rechercher un indicateur"
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
            <!-- <IndicatorSearch
              :theme-name="selectedTheme"
              :geozone="selectedGeozone"
              @vue:updated="setLiveResults"
            /> -->
          </div>
        </nav>
        <div className="fr-col">
          <IndicatorList
            ref="indicatorListComp"
            :theme="selectedTheme"
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
