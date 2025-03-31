<script setup lang="ts">
import type { RouteMeta } from '@/router'
import { useRouteQueryAsString } from '@/router/utils'
import { useFiltersState } from '@/utils/filters'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const meta = route.meta as RouteMeta
const routeQuery = useRouteQueryAsString().query

const { filtersState, filtersConf } = useFiltersState(
  routeQuery,
  meta.filterKey || 'datasets'
)

const navigate = (data?: Record<string, string | null>) => {
  router.push({
    name: 'datasets',
    query: { ...route.query, ...data },
    hash: '#datasets-list'
  })
}

const switchFilter = (filter: string, value: string | null) => {
  if (filtersState[filter].childId) {
    navigate({ [filter]: value, [filtersState[filter].childId]: null })
  } else {
    navigate({ [filter]: value })
  }
}

watch(
  () => route.query,
  () => {
    // Update filtersState based on query parameters
    Object.keys(filtersState).forEach((filter) => {
      const value = route.query[filter]
      const singleton = Array.isArray(value) ? value[0] : value
      filtersState[filter].selectedValue = singleton ?? undefined
    })
  },
  { immediate: true }
)
</script>

<template>
  <div className="filterForm">
    <div
      v-for="filter in filtersConf.items"
      :key="filter.id"
      class="fr-select-group"
    >
      <SelectComponent
        :default-option="filter.default_option"
        :label="filter.name"
        :options="filtersState[filter.id].options"
        :model-value="filtersState[filter.id].selectedValue"
        @update:model-value="(value) => switchFilter(filter.id, value)"
      />
    </div>
  </div>
</template>
