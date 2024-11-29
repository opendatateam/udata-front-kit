<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import { computed, inject, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import GenericContainer from '@/components/GenericContainer.vue'
import type { BreadcrumbItem } from '@/model/breadcrumb'
import {
  AccessibilityPropertiesKey,
  type AccessibilityPropertiesType
} from '@/model/injectionKeys'
import IndicatorList from '../../components/indicators/IndicatorList.vue'
import IndicatorSearch from '../../components/indicators/IndicatorSearch.vue'
import type { IndicatorFilters } from '../../model/indicator'

const route = useRoute()
const router = useRouter()

type Props = IndicatorFilters & {
  query: string
  page: string | null
  sort: string | null
  geozone: string | null
}
const props = withDefaults(defineProps<Props>(), { query: '' })

const indicatorListComp = ref<InstanceType<typeof IndicatorList> | null>(null)

/* TODO: factorize w/ BouquetsListView */
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
  if (props.query) {
    return `${route.meta.title} pour "${props.query}"`
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

const search = useDebounceFn((query) => {
  router
    .push({
      name: 'indicators',
      query: { ...route.query, q: query }
    })
    .then(() => {
      setLiveResults()
    })
}, 600)
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
      <!-- FIXME: sync query from url on refresh/visit -->
      <DsfrSearchBar
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
            <IndicatorSearch
              :theme="props.theme"
              :enjeu="props.enjeu"
              :geozone="props.geozone"
              @vue:updated="setLiveResults"
            />
          </div>
        </nav>
        <div className="fr-col">
          <IndicatorList
            ref="indicatorListComp"
            :theme="props.theme"
            :enjeu="props.enjeu"
            :geozone="props.geozone"
            :query="props.query"
            :page="props.page ? parseInt(props.page) : 1"
            :sort="props.sort"
            @clear-filters="setLiveResults"
          />
        </div>
      </div>
    </div>
  </GenericContainer>
</template>

<style scoped>
/* TODO: factorize w/ BouquetsListView */
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
