<script setup lang="ts">
import FilterSelectComponent from '@/components/FilterSelectComponent.vue'
import type { IndicatorMesh } from '../../../model/indicator'

const props = defineProps<{ mesh: IndicatorMesh }>()
const selectedTerritory = defineModel<string>({ required: true })

type SelectOption = { id: string; name: string }

const territoryOptions = ref<SelectOption[]>([])

watch(
  () => props.mesh,
  async (mesh) => {
    if (mesh === 'fr') {
      territoryOptions.value = []
      return
    }

    let data: [string, string][]
    if (mesh === 'epci') {
      const { EPCIS } = await import('./data/epcis')
      data = EPCIS
    } else if (mesh === 'region') {
      const { REGIONS } = await import('./data/regions')
      data = REGIONS
    } else {
      const { DEPARTEMENTS } = await import('./data/departements')
      data = DEPARTEMENTS
    }

    territoryOptions.value = data.map(([code, name]) => ({
      id: code,
      name: `${name} - ${code}`
    }))
    selectedTerritory.value = territoryOptions.value[0]?.id ?? ''
  },
  { immediate: true }
)
</script>

<template>
  <div v-if="mesh !== 'fr'" class="territory-select">
    <FilterSelectComponent
      v-model="selectedTerritory"
      :options="territoryOptions"
      label="Territoire"
    />
  </div>
</template>

<style scoped>
.territory-select {
  width: 220px;
}

:deep(.multiselect-clear) {
  display: none;
}

:deep(.multiselect-single-label),
:deep(.multiselect-search),
:deep(.multiselect-option) {
  font-size: 0.8rem;
}
</style>
