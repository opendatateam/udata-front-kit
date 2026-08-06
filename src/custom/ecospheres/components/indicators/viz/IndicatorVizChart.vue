<script setup lang="ts">
import { useResourceStore } from '@/store/ResourceStore'
import type {
  Indicator,
  IndicatorExtrasData,
  IndicatorMesh,
  IndicatorResource
} from '../../../model/indicator'
import { debug } from './debug'
import { getSeriesColor } from './enums'
import IndicatorVizAxesFilter from './IndicatorVizAxesFilter.vue'
import IndicatorVizMeshSelect from './IndicatorVizMeshSelect.vue'
import IndicatorVizOneYearValue from './IndicatorVizOneYearValue.vue'
import IndicatorVizTerritorySelect from './IndicatorVizTerritorySelect.vue'
import { makeSeries } from './series'
import type { AxisValueDisplay } from './types'
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

// See IndicatorMesh: shows an explanatory message instead of the chart.
const isCommuneMesh = computed(
  () => selectedIndicatorVizMesh.value === 'commune'
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

watch(availableAxisValues, (axisValues) => {
  if (Object.keys(axisValues).length === 0) return
  axisFilters.value = { ...axisValues }
  groupedAxis.value = Object.fromEntries(
    Object.keys(axisValues).map((axis) => [axis, summable.value])
  )
})

// The axis currently split into its own series (as opposed to summed away).
// Only meaningful when the indicator is summable: for a non-summable
// indicator every axis is simultaneously ungrouped (see the watch above),
// so there's no single "active" axis - splitting by more than one axis at a
// time isn't something summable indicators expose in the UI, but it's the
// default (only) state for non-summable ones.
const activeAxis = computed(() =>
  summable.value
    ? (Object.keys(groupedAxis.value).find(
        (axis) => groupedAxis.value[axis] === false
      ) ?? null)
    : null
)

// Uses axisFilters keys (not availableAxisValues, which creates a new object
// reference on every recompute) to build series. When one axis is active,
// its series are built from every available value (not just the checked
// ones) so each value keeps a stable array position - and thus a stable
// color, since colors are assigned by array index - no matter what else
// gets checked/unchecked. Checked-off values are hidden on the chart.js
// dataset instead of removed, the same mechanism a legend click uses, so
// hiding one line never reshuffles the others' colors.
const series = computed(() => {
  const axisNames = Object.keys(axisFilters.value)
  const filtersForSeries = activeAxis.value
    ? {
        ...axisFilters.value,
        [activeAxis.value]: availableAxisValues.value[activeAxis.value] ?? []
      }
    : axisFilters.value

  const built = makeSeries(
    rawData.value,
    axisNames,
    filtersForSeries,
    groupedAxis.value
  )

  if (!activeAxis.value) return built

  const checked = new Set(axisFilters.value[activeAxis.value] ?? [])
  return built.map((s) => ({ ...s, hidden: !checked.has(s.label) }))
})

const isOneYear = computed(
  () => series.value.length === 1 && series.value[0].data.length === 1
)

// The chart assigns each series a color by its position in this same array
// (see useIndicatorVizChart's applyColors), so reusing it here guarantees
// the filter checkboxes always show exactly the chart's own color and order.
const activeAxisValues = computed<AxisValueDisplay[]>(() =>
  activeAxis.value
    ? series.value.map((s, idx) => ({
        value: s.label,
        color: getSeriesColor(idx)
      }))
    : []
)

const hasNoAxisSelected = computed(
  () =>
    Object.keys(availableAxisValues.value).length > 0 &&
    Object.values(axisFilters.value).some((v) => v.length === 0)
)

// activeAxis is already only non-null for a summable indicator (see above),
// which is exactly the filter checkboxes' colored branch: displaying a
// single axis's values renders as a stacked area instead of plain lines.
const isStackedArea = computed(() => !!activeAxis.value)

const chartCanvas = useTemplateRef<HTMLCanvasElement>('chartCanvas')
const chartTitle = computed(() => props.indicator.title ?? '')

const { hasNoData } = useIndicatorVizChart({
  canvasRef: chartCanvas,
  series,
  extras: indicatorExtras,
  chartTitle,
  stacked: isStackedArea
})

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
          :active-axis-values="activeAxisValues"
        />
      </div>

      <DsfrAlert
        v-if="isCommuneMesh"
        type="info"
        description="Les données communales sont présentes dans les fichiers, mais la prévisualisation des communes n'est pas disponible."
        :small="true"
        class="fr-mt-4w"
      />

      <DsfrAlert
        v-else-if="error"
        type="error"
        :description="`Erreur lors du chargement : ${error}`"
        :small="true"
        class="fr-mt-4w"
      />

      <DsfrAlert
        v-else-if="hasNoAxisSelected && !isLoading"
        type="info"
        description="Aucune valeur d'axe sélectionnée."
        :small="true"
        class="fr-mt-4w"
      />

      <DsfrAlert
        v-else-if="hasNoData && !isLoading"
        type="info"
        description="Aucune donnée disponible pour le territoire sélectionné."
        :small="true"
        class="fr-mt-4w"
      />

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

/* Fixed 3-column grid, not flex: with flex, the number of visible blocks
   changes (2 in "Regroupé" mode, 3 once an axis is picked), so equal flex
   shares would resize existing columns whenever the 3rd one appears/disappears.
   Grid tracks exist whether or not their cell is filled, so nothing reflows.
   The first two columns are "auto": their content (selects, radio options)
   doesn't change between states, so they keep a stable, minimal width in
   both. The values column is capped rather than "1fr": "1fr" would stretch
   it across all remaining space in a wide container, visually detaching it
   from the radios column - minmax(auto, 420px) gives long labels room to
   wrap without ever stretching past what the content needs. */
.dropdowns {
  display: grid;
  grid-template-columns: auto auto minmax(auto, 420px);
  width: 100%;
  gap: 1rem;
  padding: 16px;
  background-color: #fafafa;
  border: 1px solid #f5f5f5;
}

.geo-dropdowns {
  display: flex;
  flex-direction: column;
  gap: 0;
  align-items: start;
  min-width: 0;
}

:deep(.geo-dropdowns .fr-select-group) {
  width: 220px;
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

:deep(.geo-dropdowns .fr-label) {
  font-weight: 700;
}

.help {
  font-size: 0.7rem;
  color: #797979;
  margin-top: 8px;
}
</style>
