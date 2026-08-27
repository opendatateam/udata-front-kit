<script setup lang="ts">
import type { IndicatorMesh } from '../../../model/indicator'
import { MESHES } from './enums'

const props = defineProps<{ availableMeshes: IndicatorMesh[] }>()
const selectedIndicatorVizMesh = defineModel<IndicatorMesh>({
  required: true
})

// 'commune' is excluded from MESHES (see enums.ts), so it's added back in
// separately here, using the same availableMeshes check as the others.
const meshOptions = computed<[IndicatorMesh, string][]>(() => [
  ...MESHES.filter(([mesh]) => props.availableMeshes.includes(mesh)),
  ...(props.availableMeshes.includes('commune')
    ? ([['commune', 'Commune']] as [IndicatorMesh, string][])
    : [])
])
</script>

<template>
  <div class="fr-select-group">
    <label class="fr-label" for="viz-mesh-select">Maille territoriale</label>
    <select
      id="viz-mesh-select"
      v-model="selectedIndicatorVizMesh"
      class="fr-select"
    >
      <option v-for="[value, label] in meshOptions" :key="value" :value="value">
        {{ label }}
      </option>
    </select>
  </div>
</template>
