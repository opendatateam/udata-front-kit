<script setup lang="ts">
import type { SelectFilterConfig } from '@/router/utils'
import { trackEvent } from '@/utils/matomo'
import { SearchableSelect, useSearchFilter } from '@datagouv/components-next'
import { computed } from 'vue'

type FilterOption = SelectFilterConfig['values'][number]

const props = defineProps<{ config: SelectFilterConfig; pageKey: string }>()

const urlValue = useSearchFilter(props.config.urlParam, {
  apiParam: props.config.apiParam,
  typeKeys: props.config.typeKeys
})

// Bridge between SearchableSelect (FilterOption | null) and useSearchFilter (string | undefined)
const model = computed<FilterOption | null>({
  get: () =>
    props.config.values.find((v) => v.value === urlValue.value) ?? null,
  set: (opt) => {
    urlValue.value = opt?.value ?? undefined
    // Track the selection, not the clear, so Matomo only sees actual filter usage
    if (opt) {
      trackEvent(
        `Filter ${props.pageKey} list`,
        `Trigger custom filter ${props.config.urlParam}`,
        opt.value
      )
    }
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
