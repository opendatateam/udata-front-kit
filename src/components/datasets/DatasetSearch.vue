<script setup lang="ts">
import { useRouteQueryAsString } from '@/router/utils'
import { useFiltersConf } from '@/utils/config'
import { useFiltersState } from '@/utils/filters'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const routeQuery = useRouteQueryAsString().query
const filtersConf = useFiltersConf('datasets')

const filtersState = useFiltersState(routeQuery, filtersConf)

const navigate = (data?: Record<string, string | null>) => {
  router.push({
    name: 'datasets',
    query: { ...route.query, ...data },
    hash: '#datasets-list'
  })
}

const switchFilter = (filter: string, value: string | null) => {
  filtersState[filter].selectedValue = value ?? undefined
  // empty linked child value
  if (filtersState[filter].childId) {
    filtersState[filtersState[filter].childId].selectedValue = undefined
    navigate({ [filter]: value, [filtersState[filter].childId]: null })
  } else {
    navigate({ [filter]: value })
  }
}
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
