<script setup lang="ts">
import type { IndicatorMesh } from '../../../model/indicator'
import { MESHES } from './enums'

const props = defineProps<{ availableMeshes: IndicatorMesh[] }>()
const selectedIndicatorVizMesh = defineModel<IndicatorMesh>({
  required: true
})

// 'commune' is never in availableMeshes (see IndicatorMesh), so it's added
// unconditionally rather than filtered like the others.
const meshOptions = computed<[IndicatorMesh, string][]>(() => [
  ...MESHES.filter(([mesh]) => props.availableMeshes.includes(mesh)),
  ['commune', 'Commune']
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
