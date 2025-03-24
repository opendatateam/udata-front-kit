<script setup lang="ts">
import type { TagSelectOption } from '@/model/tag'
import { useFiltersConf } from '@/utils/config'
import { getTagOptions } from '@/utils/tags'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const filtersConf = useFiltersConf('datasets')

interface FilterState {
  id: string
  selectedValue: string | undefined
  options: TagSelectOption[]
  childId?: string
  isParent: boolean
}

const filtersState = reactive<Record<string, FilterState>>({})

// Initialize the filters structure
const withParent = filtersConf.items.map((filter) => filter.child)
filtersConf.items.forEach((filter) => {
  filtersState[filter.id] = {
    id: filter.id,
    selectedValue: undefined,
    options: withParent.includes(filter.id)
      ? []
      : getTagOptions('datasets', filter.id),
    childId: filter.child,
    isParent: !!filter.child
  }
})

// Watch parent filter changes to update their children
Object.values(filtersState).forEach((filter) => {
  if (filter.isParent) {
    watch(
      () => filter.selectedValue,
      async (newParentValue) => {
        if (filter.childId) {
          // Update child filter's options based on parent selection
          const childFilter = filtersState[filter.childId]
          childFilter.options = getTagOptions(
            'datasets',
            filter.childId,
            newParentValue
          )
          // Clear child selection when parent changes
          childFilter.selectedValue = undefined
        }
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
  navigate({ [filter]: value })
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
