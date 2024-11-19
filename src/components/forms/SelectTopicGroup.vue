<script lang="ts" setup>
import type { DatasetProperties, DatasetsGroups } from '@/model/topic'
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'

const datasetProperties = defineModel('properties-model', {
  type: Object as () => DatasetProperties,
  default: {}
})

const datasetsGroups = defineModel('groups-model', {
  type: Object as () => DatasetsGroups,
  default: []
})

const groupOptions = computed(() =>
  Array.from(datasetsGroups.value, ([key]) => key)
)
</script>

<template>
  <Multiselect
    id="input-regroupement"
    v-model="datasetProperties.group"
    :options="groupOptions"
    :searchable="true"
    :limit="5"
    :strict="false"
    no-options-text="Il n'y a pas encore de regroupement dans ce bouquet."
    no-results-text="Aucun regroupement existant."
    :create-option="true"
    name="select"
    placeholder=""
    :aria="{
      'aria-describedby': 'regroupement-description'
    }"
  >
    <template #option="{ option }">
      <p v-if="option.__CREATE__">
        Ajouter "{{ option.label }}" comme regroupement
      </p>
      <p v-else>{{ option.label }}</p>
    </template>
  </Multiselect>
</template>

<style scoped></style>
