<script setup lang="ts">
import FilterSelectComponent from '@/components/FilterSelectComponent.vue'
import { useRouteMeta, useRouteQueryAsString } from '@/router/utils'
import { useOrganizationStore } from '@/store/OrganizationStore'
import { onMounted, ref, type Ref } from 'vue'

defineProps<{
  label: string
  defaultOption?: string | null
}>()

const emit = defineEmits<{
  'update:value': [value: string | null]
}>()

const meta = useRouteMeta()
const routeQuery = useRouteQueryAsString().query
const organizationStore = useOrganizationStore()

const organizationOptions: Ref<
  {
    id: string
    name: string
  }[]
> = ref([])
const selectedOrganization = ref(routeQuery.organization || null)

onMounted(async () => {
  organizationStore
    .loadFromConfigFlat(meta.pageKey || 'datasets')
    .then((orgs) => {
      organizationOptions.value = orgs.map(({ id, name }) => ({ id, name }))
    })
})
</script>

<template>
  <FilterSelectComponent
    :default-option="defaultOption || 'Toutes les organisations'"
    :label="label"
    :options="organizationOptions"
    :model-value="selectedOrganization"
    @update:model-value="(value: string | null) => emit('update:value', value)"
  />
</template>
