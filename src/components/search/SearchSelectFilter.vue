<script setup lang="ts">
import type { SelectFilterConfig } from '@/router/utils'
import { SearchableSelect, useSearchFilter } from '@datagouv/components-next'
import { computed } from 'vue'

type FilterOption = SelectFilterConfig['values'][number]

const props = defineProps<{ config: SelectFilterConfig }>()

const urlValue = useSearchFilter(props.config.urlParam, {
  apiParam: props.config.apiParam
})

// Bridge between SearchableSelect (FilterOption | null) and useSearchFilter (string | undefined)
const model = computed<FilterOption | null>({
  get: () =>
    props.config.values.find((v) => v.value === urlValue.value) ?? null,
  set: (opt) => {
    urlValue.value = opt?.value ?? undefined
  }
})
</script>

<template>
  <SearchableSelect
    v-model="model"
    :options="config.values"
    :get-option-id="(opt) => opt.value"
    :display-value="(opt) => opt?.label ?? ''"
    :placeholder="config.defaultLabel ?? 'Tous'"
    :label="config.label"
    :multiple="false"
  />
</template>
