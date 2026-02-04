<script setup lang="ts">
import SelectOrganization from '@/components/forms/SelectOrganization.vue'
import SelectSpatialCoverage from '@/components/forms/SelectSpatialCoverage.vue'
import SelectSpatialGranularity from '@/components/forms/SelectSpatialGranularity.vue'
import type { Facets } from '@/model/api'
import type { PageFilterConf } from '@/model/config'
import type { SpatialCoverage } from '@/model/spatial'
import { useRouteMeta, useRouteQueryAsString } from '@/router/utils'
import { useSpatialStore } from '@/store/SpatialStore'
import { useUserStore } from '@/store/UserStore'
import { getOrganizationOptionsFromFacets } from '@/utils/facets'
import { useFiltersState } from '@/utils/filters'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CheckboxComponent from '../CheckboxComponent.vue'
import FilterSelectComponent from '../FilterSelectComponent.vue'

const props = defineProps<{
  searchStore?: { facets: Facets | undefined } | null
}>()

const router = useRouter()
const route = useRoute()
const meta = useRouteMeta()
const routeQuery = useRouteQueryAsString().query

const userStore = useUserStore()
const { loggedIn } = storeToRefs(userStore)

const selectedOrganization = ref(routeQuery.organization || null)
const selectedGranularity = ref(routeQuery.granularity || undefined)
const selectedGeozone: Ref<string | null> = ref(null)
const selectedSpatialCoverage: Ref<SpatialCoverage | undefined> = ref(undefined)

const { filtersState, pageConf } = useFiltersState(
  routeQuery,
  meta.pageKey || 'datasets'
)

// Derive organization options from search store facets
const organizationOptions = computed(() => {
  if (!props.searchStore?.facets) return []
  return getOrganizationOptionsFromFacets(props.searchStore.facets)
})

const navigate = (data?: Record<string, string | null>) => {
  router.push({
    name: route.name,
    query: { ...route.query, ...data },
    hash: '#list'
  })
}

const switchFilter = (filter: string, value: string | null) => {
  if (filtersState[filter]?.childId) {
    navigate({ [filter]: value, [filtersState[filter].childId]: null })
  } else {
    navigate({ [filter]: value })
  }
}

const switchSpatialCoverage = (
  spatialCoverage: SpatialCoverage | null | undefined
) => {
  selectedGeozone.value = spatialCoverage != null ? spatialCoverage.id : null
  navigate({ geozone: selectedGeozone.value })
}

const shouldShowFilter = (filter: PageFilterConf) => {
  return (
    !filter.hide_on_list &&
    ((filter.authenticated && loggedIn.value) || !filter.authenticated)
  )
}

watch(
  () => route.query,
  async () => {
    // Update filtersState based on query parameters
    Object.keys(filtersState).forEach((filter) => {
      const value = route.query[filter]
      const singleton = Array.isArray(value) ? value[0] : value
      filtersState[filter].selectedValue = singleton ?? null
    })

    // Update organization
    const organization = route.query.organization
    selectedOrganization.value =
      (Array.isArray(organization) ? organization[0] : organization) ?? null

    // Update granularity
    const granularity = route.query.granularity
    selectedGranularity.value =
      (Array.isArray(granularity) ? granularity[0] : granularity) ?? undefined

    // Update spatial coverage
    const geozone = route.query.geozone
    const geozoneValue = Array.isArray(geozone) ? geozone[0] : geozone
    if (geozoneValue) {
      selectedSpatialCoverage.value =
        await useSpatialStore().loadZone(geozoneValue)
    } else {
      selectedSpatialCoverage.value = undefined
    }
  },
  { immediate: true }
)
</script>

<template>
  <template v-for="filter in pageConf.filters" :key="filter.id">
    <div v-if="shouldShowFilter(filter)" class="fr-select-group">
      <FilterSelectComponent
        v-if="filter.type === 'select'"
        :default-option="filter.default_option"
        :label="filter.name"
        :options="filtersState[filter.id].options"
        :model-value="filtersState[filter.id].selectedValue"
        @update:model-value="(value) => switchFilter(filter.id, value)"
      />
      <SelectOrganization
        v-else-if="filter.type === 'organization'"
        :model-value="selectedOrganization"
        :label="filter.name"
        :default-option="filter.default_option"
        :options="organizationOptions"
        @update:model-value="(value) => switchFilter('organization', value)"
      />
      <SelectSpatialGranularity
        v-else-if="filter.type === 'spatial_granularity'"
        :default-option="filter.default_option"
        :label="filter.name"
        :model-value="selectedGranularity"
        @update:model-value="(value) => switchFilter('granularity', value)"
      />
      <template v-else-if="filter.type === 'spatial_zone'">
        <label class="fr-label" for="select-spatial-coverage">{{
          filter.name
        }}</label>
        <SelectSpatialCoverage
          v-model:spatial-coverage-model="selectedSpatialCoverage"
          :short="true"
          @update:spatial-coverage-model="switchSpatialCoverage"
        />
      </template>
      <CheckboxComponent
        v-else-if="filter.type === 'checkbox'"
        :model-value="filtersState[filter.id]?.selectedValue"
        :default-value="Boolean(filter.default_value)"
        :label="filter.name"
        :name="filter.id"
        @update:model-value="(value) => switchFilter(filter.id, value)"
      />
    </div>
  </template>
</template>
