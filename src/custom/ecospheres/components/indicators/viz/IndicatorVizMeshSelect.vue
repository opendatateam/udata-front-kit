<script setup lang="ts">
import type { IndicatorMesh } from '../../../model/indicator'
import { MESHES } from './enums'

const props = defineProps<{ availableMeshes: IndicatorMesh[] }>()
const selectedIndicatorVizMesh = defineModel<IndicatorMesh>({
  required: true
})

const meshOptions = computed(() =>
  MESHES.filter(([mesh]) => props.availableMeshes.includes(mesh))
)
</script>

<template>
  <div class="fr-select-group">
    <label class="fr-label" for="viz-mesh-select">Maille</label>
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
