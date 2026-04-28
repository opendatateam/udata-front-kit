<script setup lang="ts">
import SearchSelectFilter from '@/components/search/SearchSelectFilter.vue'
import type { OrganizationFilterConfig } from '@/router/utils'
import { useOrganizationStore } from '@/store/OrganizationStore'
import { computed, onMounted, ref, watch } from 'vue'

const props = defineProps<{ config: OrganizationFilterConfig }>()

const organizationStore = useOrganizationStore()
const orgOptions = ref<{ value: string; label: string }[]>([])

const loadOrgs = async (key: string) => {
  const orgs = await organizationStore.loadFromConfigFlat(key)
  orgOptions.value = orgs.map(({ id, name }) => ({ value: id, label: name }))
}

onMounted(() => loadOrgs(props.config.pageKey))
watch(
  () => props.config.pageKey,
  (newKey) => loadOrgs(newKey)
)

const selectConfig = computed(() => ({
  urlParam: 'organization',
  apiParam: 'organization',
  label: props.config.label,
  defaultLabel: props.config.defaultLabel,
  values: orgOptions.value
}))
</script>

<template>
  <SearchSelectFilter :config="selectConfig" />
</template>
