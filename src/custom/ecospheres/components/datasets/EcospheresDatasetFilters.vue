<script setup lang="ts">
import SelectOrFilterComponent from '@/components/SelectOrFilterComponent.vue'
import { useRouteQueryAsString } from '@/router/utils'
import { useOrganizationStore } from '@/store/OrganizationStore'
import { useFiltersState } from '@/utils/filters'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const routeQuery = useRouteQueryAsString().query
const store = useOrganizationStore()

const { filtersState, pageConf } = useFiltersState(routeQuery, 'datasets')

const organizationOptions = computed(() =>
  store.flatData.map(({ id, name }) => ({ id, name }))
)
const selectedOrganization = ref(routeQuery.organization || undefined)

const navigate = (data?: Record<string, string | null>) => {
  router.push({
    name: 'datasets',
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

onMounted(() => {
  store.loadFromConfigFlat()
})

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
</script>

<template>
  <div className="filterForm">
    <div class="fr-select-group">
      <SelectOrFilterComponent
        default-option="Toutes les organisations"
        label="Organisation"
        :options="organizationOptions"
        :model-value="selectedOrganization"
        @update:model-value="(value) => switchFilter('organization', value)"
      />
    </div>
    <div
      v-for="filter in pageConf.filters"
      :key="filter.id"
      class="fr-select-group"
    >
      <SelectOrFilterComponent
        :default-option="filter.default_option"
        :label="filter.name"
        :options="filtersState[filter.id].options"
        :model-value="filtersState[filter.id].selectedValue"
        @update:model-value="(value) => switchFilter(filter.id, value)"
      />
    </div>
  </div>
</template>
