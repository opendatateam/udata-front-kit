<script setup lang="ts">
import type { PageFilterConf } from '@/model/config'
import { useRouteQuery } from '@vueuse/router'

const props = defineProps<{ filter: PageFilterConf }>()

// Bind to the API param (e.g. 'tag') or fall back to the filter id
const queryParam = props.filter.api_param ?? props.filter.id
const selected = useRouteQuery<string | undefined>(queryParam)
</script>

<template>
  <div v-if="filter.values?.length" class="fr-form-group">
    <fieldset class="fr-fieldset">
      <legend class="fr-fieldset__legend fr-text--regular fr-mb-1w">
        {{ filter.name }}
      </legend>
      <div class="fr-select-group">
        <select
          :id="`filter-${filter.id}`"
          v-model="selected"
          class="fr-select"
          :aria-label="filter.name"
        >
          <option :value="undefined">
            {{ filter.default_option ?? `Tous` }}
          </option>
          <option v-for="val in filter.values" :key="val.id" :value="val.id">
            {{ val.name }}
          </option>
        </select>
      </div>
    </fieldset>
  </div>
</template>
