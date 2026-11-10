<script setup lang="ts">
import FilterSelectComponent from '@/components/FilterSelectComponent.vue'
import type { IndicatorMesh } from '../../../model/indicator'

const props = defineProps<{ mesh: IndicatorMesh }>()
const selectedTerritory = defineModel<string>({ required: true })
// emitted on user selection only, not on automatic fallback
const emit = defineEmits<{ select: [territory: string] }>()

type SelectOption = { id: string; name: string }

const territoryOptions = ref<SelectOption[]>([])

const userSelectedTerritory = computed({
  get: () => selectedTerritory.value,
  set: (territory: string) => {
    selectedTerritory.value = territory
    emit('select', territory)
  }
})

watch(
  () => props.mesh,
  async (mesh) => {
    if (mesh === 'fr' || mesh === 'commune') {
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

    // mesh changed while the territories were loading
    if (props.mesh !== mesh) return

    territoryOptions.value = data.map(([code, name]) => ({
      id: code,
      name: `${name} - ${code}`
    }))
    // keeps a valid preselected territory (e.g. from the URL)
    const isValid = territoryOptions.value.some(
      (option) => option.id === selectedTerritory.value
    )
    if (!isValid) {
      selectedTerritory.value = territoryOptions.value[0]?.id ?? ''
    }
  },
  { immediate: true }
)
</script>

<template>
  <div v-if="mesh !== 'fr' && mesh !== 'commune'" class="territory-select">
    <FilterSelectComponent
      v-model="userSelectedTerritory"
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
</style>
