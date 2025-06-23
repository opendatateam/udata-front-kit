<script setup lang="ts">
import SelectSpatialCoverage from '@/components/forms/SelectSpatialCoverage.vue'
import SelectSpatialGranularity from '@/components/forms/SelectSpatialGranularity.vue'
import type { SpatialCoverage } from '@/model/spatial'
import { useRouteMeta, useRouteQueryAsString } from '@/router/utils'
import { useSpatialStore } from '@/store/SpatialStore'
import { useUserStore } from '@/store/UserStore'
import { useFiltersState } from '@/utils/filters'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import CheckboxComponent from '../CheckboxComponent.vue'
import FilterSelectComponent from '../FilterSelectComponent.vue'

const router = useRouter()
const route = useRoute()
const meta = useRouteMeta()
const routeQuery = useRouteQueryAsString().query

const userStore = useUserStore()
const { loggedIn } = storeToRefs(userStore)

const selectedGranularity = ref(routeQuery.granularity || undefined)
const selectedGeozone: Ref<string | null> = ref(null)
const selectedSpatialCoverage: Ref<SpatialCoverage | undefined> = ref(undefined)

const { filtersState, pageConf } = useFiltersState(
  routeQuery,
  meta.pageKey || 'datasets'
)

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

watch(
  () => route.query,
  () => {
    // Update filtersState based on query parameters
    Object.keys(filtersState).forEach((filter) => {
      const value = route.query[filter]
      const singleton = Array.isArray(value) ? value[0] : value
      filtersState[filter].selectedValue = singleton ?? null
    })
  },
  { immediate: true }
)

onMounted(async () => {
  if (routeQuery.geozone) {
    selectedSpatialCoverage.value = await useSpatialStore().loadZone(
      routeQuery.geozone
    )
  }
})
</script>

<template>
  <template v-for="filter in pageConf.filters" :key="filter.id">
    <div
      v-if="(filter.authenticated && loggedIn) || !filter.authenticated"
      class="fr-select-group"
    >
      <FilterSelectComponent
        v-if="filter.type === 'select'"
        :default-option="filter.default_option"
        :label="filter.name"
        :options="filtersState[filter.id].options"
        :model-value="filtersState[filter.id].selectedValue"
        @update:model-value="(value) => switchFilter(filter.id, value)"
      />
      <SelectSpatialGranularity
        v-if="filter.type === 'spatial_granularity'"
        :default-option="filter.default_option"
        :label="filter.name"
        :model-value="selectedGranularity"
        @update:model-value="(value) => switchFilter('granularity', value)"
      />
      <template v-if="filter.type === 'spatial_zone'">
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
        v-if="filter.type === 'checkbox'"
        :model-value="filtersState[filter.id]?.selectedValue"
        :default-value="Boolean(filter.default_value)"
        :label="filter.name"
        :name="filter.id"
        @update:model-value="(value) => switchFilter(filter.id, value)"
      />
    </div>
  </template>
</template>
