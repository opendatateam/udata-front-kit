<script lang="ts" setup>
import { type GeoJSONSource, type MapGeoJSONFeature } from 'maplibre-gl'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

import { BLUE, integerFormat } from '@/custom/justice/utils/chartTheme'
import { mountFranceMap } from '@/custom/justice/utils/franceMap'
import {
  boundsOf,
  popupLines,
  type MapFeature,
  type MapGeometry
} from '@/custom/justice/utils/geojson'

const LOW = '#E3E3FD'
const NO_DATA = '#E5E5E5'

const props = defineProps<{
  features: MapFeature[]
  metrics: { id: string; label: string }[]
  ariaLabel: string
}>()

const container = ref<HTMLDivElement | null>(null)
const selected = ref(props.metrics[0]?.id ?? '')
const view = ref<'metro' | 'outremer'>('metro')
let mapHandle: ReturnType<typeof mountFranceMap> | null = null
let hoveredId: string | number | null = null

const selectedMetric = computed(
  () =>
    props.metrics.find((metric) => metric.id === selected.value) ??
    props.metrics[0]
)

const legend = computed(() => {
  const values = props.features
    .map((feature) => feature.properties[selected.value])
    .filter((value): value is number => typeof value === 'number')
  if (values.length === 0 || !selectedMetric.value) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  return { min, max: max === min ? min + 1 : max }
})

function largestPartCenter(geometry: MapGeometry): [number, number] | null {
  const polygons: unknown[] =
    geometry.type === 'Polygon'
      ? [geometry.coordinates]
      : geometry.type === 'MultiPolygon'
        ? (geometry.coordinates as unknown[])
        : []
  let best: [number, number] | null = null
  let bestArea = -1
  for (const polygon of polygons) {
    if (!Array.isArray(polygon) || !Array.isArray(polygon[0])) continue
    const ring = polygon[0]
    let minLon = 180
    let minLat = 90
    let maxLon = -180
    let maxLat = -90
    let count = 0
    let sumLon = 0
    let sumLat = 0
    for (const point of ring) {
      if (
        !Array.isArray(point) ||
        typeof point[0] !== 'number' ||
        typeof point[1] !== 'number'
      ) {
        continue
      }
      count += 1
      sumLon += point[0]
      sumLat += point[1]
      minLon = Math.min(minLon, point[0])
      minLat = Math.min(minLat, point[1])
      maxLon = Math.max(maxLon, point[0])
      maxLat = Math.max(maxLat, point[1])
    }
    if (count === 0) continue
    const area = (maxLon - minLon) * (maxLat - minLat)
    if (area > bestArea) {
      bestArea = area
      best = [sumLon / count, sumLat / count]
    }
  }
  return best
}

function fillColor() {
  const scale = legend.value
  if (!scale) return NO_DATA
  return [
    'case',
    ['==', ['get', selected.value], null],
    NO_DATA,
    [
      'interpolate',
      ['linear'],
      ['to-number', ['get', selected.value]],
      scale.min,
      LOW,
      scale.max,
      BLUE
    ]
  ] as const
}

function clearHover() {
  const map = mapHandle?.map
  if (map && hoveredId != null) {
    map.setFeatureState({ source: 'areas', id: hoveredId }, { hover: false })
  }
  hoveredId = null
  mapHandle?.popup.remove()
  if (map) map.getCanvas().style.cursor = ''
}

function applyMetric() {
  const map = mapHandle?.map
  if (!map?.getLayer('areas-fill')) return
  map.setPaintProperty('areas-fill', 'fill-color', fillColor())
}

function showView(next: 'metro' | 'outremer') {
  view.value = next
  const map = mapHandle?.map
  if (!map) return
  const features =
    next === 'outremer'
      ? props.features.filter(
          (feature) => feature.properties.nom_court === 'Outre-mer'
        )
      : props.features.filter(
          (feature) => feature.properties.nom_court !== 'Outre-mer'
        )
  const bounds = boundsOf(features)
  if (bounds) map.fitBounds(bounds, { padding: 36, animate: true })
}

function popupContent(feature: MapGeoJSONFeature): HTMLElement {
  const name = String(
    feature.properties?.nom || feature.properties?.nom_court || ''
  )
  const raw = feature.properties?.[selected.value]
  const value =
    raw == null || raw === ''
      ? `${selectedMetric.value?.label ?? ''} : non renseigné`
      : `${selectedMetric.value?.label ?? ''} : ${integerFormat.format(Number(raw))}`
  return popupLines([name, value])
}

function initMap() {
  const map = mapHandle?.map
  const popup = mapHandle?.popup
  if (!map || !popup) return
  map.addSource('areas', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: props.features },
    promoteId: 'nom_court'
  })
  map.addSource('area-labels', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: props.features.flatMap((feature) => {
        const center = largestPartCenter(feature.geometry)
        if (!center) return []
        return [
          {
            type: 'Feature' as const,
            properties: { nom_court: feature.properties.nom_court },
            geometry: { type: 'Point' as const, coordinates: center }
          }
        ]
      })
    }
  })
  map.addLayer({
    id: 'areas-fill',
    type: 'fill',
    source: 'areas',
    paint: { 'fill-color': fillColor(), 'fill-opacity': 0.86 }
  })
  map.addLayer({
    id: 'areas-line',
    type: 'line',
    source: 'areas',
    paint: {
      'line-color': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        BLUE,
        '#ffffff'
      ],
      'line-width': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        2.5,
        1
      ]
    }
  })
  map.addLayer({
    id: 'areas-label',
    type: 'symbol',
    source: 'area-labels',
    layout: {
      'text-field': ['get', 'nom_court'],
      'text-font': ['Noto Sans Regular'],
      'text-size': 13
    },
    paint: {
      'text-color': '#161616',
      'text-halo-color': '#ffffff',
      'text-halo-width': 1.4
    }
  })
  map.on('mousemove', 'areas-fill', (event) => {
    const feature = event.features?.[0]
    if (!feature || !mapHandle) return
    if (hoveredId !== feature.id) {
      clearHover()
      hoveredId = feature.id ?? null
      if (hoveredId != null) {
        map.setFeatureState({ source: 'areas', id: hoveredId }, { hover: true })
      }
    }
    map.getCanvas().style.cursor = 'pointer'
    popup
      .setLngLat(event.lngLat)
      .setDOMContent(popupContent(feature))
      .addTo(map)
  })
  map.on('mouseleave', 'areas-fill', clearHover)
  showView('metro')
}

watch(selected, () => applyMetric())

onMounted(() => {
  if (!container.value || props.features.length === 0) return
  mapHandle = mountFranceMap(container.value)
  mapHandle.map.on('load', initMap)
})

onUnmounted(() => {
  mapHandle?.destroy()
  mapHandle = null
})

function replaceData() {
  const source = mapHandle?.map.getSource('areas')
  if (source?.type !== 'geojson') return
  ;(source as GeoJSONSource).setData({
    type: 'FeatureCollection',
    features: props.features
  })
  applyMetric()
}

watch(
  () => props.features,
  () => replaceData()
)
</script>

<template>
  <div class="justice-toolbar">
    <ul
      class="fr-btns-group fr-btns-group--inline-sm"
      role="group"
      aria-label="Indicateur affiché sur la carte"
    >
      <li v-for="metric in metrics" :key="metric.id">
        <button
          type="button"
          class="fr-btn"
          :class="{ 'fr-btn--secondary': selected !== metric.id }"
          :aria-pressed="selected === metric.id"
          @click="selected = metric.id"
        >
          {{ metric.label }}
        </button>
      </li>
    </ul>
    <ul
      class="fr-btns-group fr-btns-group--inline-sm"
      role="group"
      aria-label="Cadrage de la carte"
    >
      <li>
        <button
          type="button"
          class="fr-btn fr-btn--tertiary fr-btn--sm"
          :aria-pressed="view === 'metro'"
          @click="showView('metro')"
        >
          Métropole
        </button>
      </li>
      <li>
        <button
          type="button"
          class="fr-btn fr-btn--tertiary fr-btn--sm"
          :aria-pressed="view === 'outremer'"
          @click="showView('outremer')"
        >
          Outre-mer
        </button>
      </li>
    </ul>
  </div>
  <div v-if="legend && selectedMetric" class="justice-legend">
    <span>{{ integerFormat.format(legend.min) }}</span>
    <span class="justice-ramp" />
    <span>{{ integerFormat.format(legend.max) }}</span>
    <span class="justice-legend-caption">
      {{ selectedMetric.label }}, du plus faible au plus élevé
    </span>
  </div>
  <div
    ref="container"
    class="justice-map"
    role="application"
    :aria-label="ariaLabel"
  />
</template>
