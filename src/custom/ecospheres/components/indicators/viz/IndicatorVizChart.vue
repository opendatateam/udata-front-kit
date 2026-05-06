<script setup lang="ts">
import { useResourceStore } from '@/store/ResourceStore'
import type {
  Indicator,
  IndicatorExtrasData,
  IndicatorMesh,
  IndicatorResource
} from '../../../model/indicator'
import { debug } from './debug'
import IndicatorVizAxesFilter from './IndicatorVizAxesFilter.vue'
import IndicatorVizMeshSelect from './IndicatorVizMeshSelect.vue'
import IndicatorVizOneYearValue from './IndicatorVizOneYearValue.vue'
import IndicatorVizTerritorySelect from './IndicatorVizTerritorySelect.vue'
import { makeSeries } from './series'
import { useIndicatorVizChart } from './useIndicatorVizChart'
import { useIndicatorVizParams } from './useIndicatorVizParams'
import { useTabularData } from './useTabularData'

const props = defineProps<{
  indicator: Indicator
  tabularApiUrl: string
}>()

const resourceStore = useResourceStore()

const resources = computed<IndicatorResource[]>(() => {
  const mainGroup = resourceStore.data[props.indicator.id]?.find(
    (group) => group.type?.id === 'main'
  )
  return (
    (mainGroup?.resources as IndicatorResource[] | undefined)?.filter(
      (r) => r.extras['ecospheres-indicateurs']?.maille
    ) ?? []
  )
})

const indicatorExtras = computed<IndicatorExtrasData>(
  () => props.indicator.extras['ecospheres-indicateurs']
)

const enableVisualisation = computed(
  () => indicatorExtras.value?.enable_visualization ?? false
)
const summable = computed(() => indicatorExtras.value?.summable ?? false)

const availableIndicatorVizMeshes = computed<IndicatorMesh[]>(() =>
  resources.value.map((r) => r.extras['ecospheres-indicateurs']!.maille)
)

const {
  mesh: selectedIndicatorVizMesh,
  territory: selectedTerritory,
  meshModel,
  setMesh
} = useIndicatorVizParams()

watch(
  availableIndicatorVizMeshes,
  (meshes) => {
    if (meshes.length > 0 && !meshes.includes(selectedIndicatorVizMesh.value)) {
      setMesh(meshes[0])
    }
  },
  { immediate: true }
)

const tabularApiUrlRef = toRef(props, 'tabularApiUrl')
const { rawData, availableAxisValues, isLoading, error } = useTabularData(
  tabularApiUrlRef,
  resources,
  selectedIndicatorVizMesh,
  selectedTerritory
)

const axisFilters = ref<Record<string, string[]>>({})
const groupedAxis = ref<Record<string, boolean>>({})

watch(availableAxisValues, (axisValues, oldAxisValues) => {
  const newKeys = Object.keys(axisValues).sort().join(',')
  const oldKeys = Object.keys(oldAxisValues ?? {})
    .sort()
    .join(',')
  if (newKeys === oldKeys) return
  axisFilters.value = { ...axisValues }
  groupedAxis.value = Object.fromEntries(
    Object.keys(axisValues).map((axis) => [axis, summable.value])
  )
})

// Uses axisFilters keys (not availableAxisValues) to avoid series depending on
// availableAxisValues, which creates a new object reference on every recompute.
const series = computed(() =>
  makeSeries(
    rawData.value,
    Object.keys(axisFilters.value),
    axisFilters.value,
    groupedAxis.value
  )
)

const isOneYear = computed(
  () => series.value.length === 1 && series.value[0].data.length === 1
)

const chartCanvas = useTemplateRef<HTMLCanvasElement>('chartCanvas')
const chartTitle = computed(() => props.indicator.title ?? '')

const { hasNoData } = useIndicatorVizChart(
  chartCanvas,
  series,
  indicatorExtras,
  chartTitle
)

onMounted(() => {
  debug.log(`🔍 Indicator ${props.indicator.id} extras:`, indicatorExtras.value)
})
</script>

<template>
  <template v-if="resources.length > 0 && enableVisualisation">
    <h2 class="subtitle subtitle--uppercase">Prévisualisation</h2>
    <div data-testid="indicator-viz-chart" class="indicator-viz-chart">
      <div class="dropdowns">
        <div class="geo-dropdowns">
          <IndicatorVizMeshSelect
            v-model="meshModel"
            :available-meshes="availableIndicatorVizMeshes"
          />
          <IndicatorVizTerritorySelect
            v-model="selectedTerritory"
            :mesh="selectedIndicatorVizMesh"
          />
        </div>
        <IndicatorVizAxesFilter
          v-model:filters="axisFilters"
          v-model:grouped="groupedAxis"
          :available-axis-values="availableAxisValues"
          :summable="summable"
        />
      </div>

      <div v-if="error" class="error-container">
        Erreur lors du chargement : <em>{{ error }}</em>
      </div>

      <div v-else-if="hasNoData && !isLoading" class="no-data-container">
        Aucune donnée disponible pour le territoire sélectionné.
      </div>

      <div v-else-if="!isOneYear" class="canvas-container">
        <div v-if="isLoading" class="loading-overlay">
          <span class="loading-text">Chargement...</span>
        </div>
        <canvas ref="chartCanvas" />
        <p v-if="!indicatorExtras.ignore_format_big_number" class="help">
          k: millier, M: million, Md: milliard
        </p>
      </div>

      <IndicatorVizOneYearValue
        v-else-if="isOneYear && series[0]?.data[0]"
        :year="series[0].data[0].x"
        :value="series[0].data[0].y"
        :unite="indicatorExtras.unite"
      />
    </div>
  </template>
</template>

<style scoped>
.indicator-viz-chart {
  width: 100%;
}

.dropdowns {
  display: flex;
  flex-direction: row;
  width: 100%;
  gap: 1rem;
  padding: 16px;
  background-color: #fafafa;
  border: 1px solid #f5f5f5;
}

.geo-dropdowns {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: start;
  flex: 1;
}

:deep(.geo-dropdowns .fr-select-group) {
  width: 220px;
}

:deep(.axis-filters) {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  flex: 2;
}

:deep(.axis-column) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.canvas-container {
  position: relative;
  margin-top: 32px;
  margin-bottom: 64px;
  height: 300px;
  width: 100%;
}

.canvas-container:fullscreen {
  background: white;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  z-index: 10;
}

.loading-text {
  font-size: 0.875rem;
  color: #666;
}

.error-container,
.no-data-container {
  margin-top: 32px;
  margin-bottom: 32px;
}

:deep(label) {
  font-size: 0.7rem;
  margin-bottom: 0;
}

:deep(select) {
  margin-top: 0 !important;
  font-size: 0.8rem !important;
}

:deep(.fr-fieldset) {
  margin-top: 1rem;
  margin-bottom: 0;
}

:deep(.fr-fieldset__element) {
  margin-bottom: 0.5rem;
}

:deep(summary) {
  font-size: 0.7rem;
}

:deep(.fr-toggle label::before) {
  margin-right: 0.5rem;
}

.help {
  font-size: 0.7rem;
  color: #797979;
  margin-top: 8px;
}
</style>
