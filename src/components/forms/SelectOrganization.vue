<script setup lang="ts">
import FilterSelectComponent from '@/components/FilterSelectComponent.vue'
import { useRouteMeta } from '@/router/utils'
import { useOrganizationStore } from '@/store/OrganizationStore'
import { onMounted, ref, type Ref } from 'vue'

defineProps<{
  label: string
  defaultOption?: string | null
}>()

const selectedOrganization = defineModel({
  type: String as () => string | null,
  default: null
})

const meta = useRouteMeta()
const organizationStore = useOrganizationStore()

const organizationOptions: Ref<
  {
    id: string
    name: string
  }[]
> = ref([])

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
    v-model="selectedOrganization"
    :default-option="defaultOption || 'Toutes les organisations'"
    :label="label"
    :options="organizationOptions"
  />
</template>
