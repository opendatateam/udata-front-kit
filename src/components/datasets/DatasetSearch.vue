<script setup lang="ts">
import type { TagSelectOption } from '@/model/tag'
import { useRouteQueryAsString } from '@/router/utils'
import { useFiltersConf } from '@/utils/config'
import { getTagOptions } from '@/utils/tags'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const routeQuery = useRouteQueryAsString().query
const filtersConf = useFiltersConf('datasets')

interface FilterState {
  id: string
  selectedValue: string | undefined
  options: TagSelectOption[]
  childId?: string
}

// TODO: move to composable
const filtersState = reactive<Record<string, FilterState>>({})

const setChildOptions = (filter: FilterState, childSelectedValue?: string) => {
  if (filter.childId) {
    console.log('filter.selectedValue', filter.selectedValue)
    // Update child filter's options based on parent selection
    const childFilter = filtersState[filter.childId]
    childFilter.options = filter.selectedValue
      ? getTagOptions('datasets', filter.childId, filter.selectedValue)
      : []
    // Clear child selection when parent changes or set to initial value
    childFilter.selectedValue = childSelectedValue
  }
}

// Initialize the filters structure
const withParent = filtersConf.items.map((filter) => filter.child)
filtersConf.items.forEach((filter) => {
  filtersState[filter.id] = {
    id: filter.id,
    selectedValue: routeQuery[filter.id] || undefined,
    options: withParent.includes(filter.id)
      ? []
      : getTagOptions('datasets', filter.id),
    childId: filter.child
  }
})

Object.values(filtersState).forEach((filter) => {
  if (filter.childId) {
    // initial set of child options, with current query param if any
    setChildOptions(filter, routeQuery[filter.childId] || undefined)
    // Watch parent filter changes to update their children later in lifecycle
    watch(
      () => filter.selectedValue,
      () => {
        setChildOptions(filter)
      }
    )
  }
})

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
