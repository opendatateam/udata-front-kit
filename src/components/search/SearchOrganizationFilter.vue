<script setup lang="ts">
import type { OrganizationFilterConfig } from '@/router/utils'
import { useOrganizationStore } from '@/store/OrganizationStore'
import { SearchableSelect, useSearchFilter } from '@datagouv/components-next'
import { computed, onMounted, ref, watch } from 'vue'

const props = defineProps<{ config: OrganizationFilterConfig }>()

const organizationStore = useOrganizationStore()

const orgOptions = ref<{ id: string; name: string }[]>([])

const loadOrgs = async (key: string) => {
  const orgs = await organizationStore.loadFromConfigFlat(key)
  orgOptions.value = orgs.map(({ id, name }) => ({ id, name }))
}

onMounted(async () => {
  await loadOrgs(props.config.pageKey)
})

watch(
  () => props.config.pageKey,
  async (newKey) => {
    await loadOrgs(newKey)
  }
)

const urlValue = useSearchFilter(props.config.urlParam, {
  apiParam: props.config.apiParam
})

const model = computed<{ id: string; name: string } | null>({
  get: () =>
    urlValue.value
      ? (orgOptions.value.find((o) => o.id === urlValue.value) ?? null)
      : null,
  set: (opt) => {
    urlValue.value = opt?.id ?? undefined
  }
})
</script>

<template>
  <SearchableSelect
    v-model="model"
    :options="orgOptions"
    :get-option-id="(opt) => opt.id"
    :display-value="(opt) => opt?.name ?? ''"
    :placeholder="config.defaultLabel"
    :label="config.label"
    :multiple="false"
  />
</template>
