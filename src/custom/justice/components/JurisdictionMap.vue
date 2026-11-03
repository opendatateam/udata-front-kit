<script lang="ts" setup>
import { type GeoJSONSource, type MapGeoJSONFeature } from 'maplibre-gl'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

import { BLUE, PURPLE } from '@/custom/justice/utils/chartTheme'
import { mountFranceMap } from '@/custom/justice/utils/franceMap'
import {
  metroBounds,
  popupLines,
  type MapFeature
} from '@/custom/justice/utils/geojson'

export type JurisdictionLayer = {
  id: string
  label: string
  features: MapFeature[]
}

const props = defineProps<{
  layers: JurisdictionLayer[]
}>()

const container = ref<HTMLDivElement | null>(null)
const selected = ref(props.layers[0]?.id ?? '')
let mapHandle: ReturnType<typeof mountFranceMap> | null = null
let hoveredId: string | number | null = null

const selectedLayer = computed(
  () =>
    props.layers.find((layer) => layer.id === selected.value) ?? props.layers[0]
)

function currentFeatures(): MapFeature[] {
  return selectedLayer.value?.features ?? []
}

function clearHover() {
  const map = mapHandle?.map
  if (map && hoveredId != null) {
    map.setFeatureState({ source: 'courts', id: hoveredId }, { hover: false })
  }
  hoveredId = null
  mapHandle?.popup.remove()
  if (map) map.getCanvas().style.cursor = ''
}

function showLayer(animate: boolean) {
  clearHover()
  const source = mapHandle?.map.getSource('courts')
  if (source?.type === 'geojson') {
    ;(source as GeoJSONSource).setData({
      type: 'FeatureCollection',
      features: currentFeatures()
    })
  }
  const bounds = metroBounds(currentFeatures())
  if (bounds && mapHandle) {
    mapHandle.map.fitBounds(bounds, { padding: 32, animate })
  }
}

function initMap() {
  const map = mapHandle?.map
  const popup = mapHandle?.popup
  if (!map || !popup) return
  map.addSource('courts', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: currentFeatures() }
  })
  map.addLayer({
    id: 'courts-fill',
    type: 'fill',
    source: 'courts',
    paint: {
      'fill-color': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        BLUE,
        PURPLE
      ],
      'fill-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        0.92,
        0.45
      ]
    }
  })
  map.addLayer({
    id: 'courts-line',
    type: 'line',
    source: 'courts',
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
        0.8
      ]
    }
  })
  map.on('mousemove', 'courts-fill', (event) => {
    const feature = event.features?.[0]
    if (!feature || !mapHandle) return
    if (hoveredId !== feature.id) {
      clearHover()
      hoveredId = feature.id ?? null
      if (hoveredId != null) {
        map.setFeatureState(
          { source: 'courts', id: hoveredId },
          { hover: true }
        )
      }
    }
    map.getCanvas().style.cursor = 'pointer'
    popup
      .setLngLat(event.lngLat)
      .setDOMContent(popupContent(feature))
      .addTo(map)
  })
  map.on('mouseleave', 'courts-fill', clearHover)
  const bounds = metroBounds(currentFeatures())
  if (bounds) map.fitBounds(bounds, { padding: 32, animate: false })
}

function popupContent(feature: MapGeoJSONFeature): HTMLElement {
  return popupLines([String(feature.properties?.nom ?? '')])
}

watch(selected, () => {
  if (!mapHandle?.map.isStyleLoaded() || !mapHandle.map.getSource('courts')) {
    return
  }
  showLayer(true)
})

onMounted(() => {
  if (!container.value || currentFeatures().length === 0) return
  mapHandle = mountFranceMap(container.value)
  mapHandle.map.on('load', initMap)
})

onUnmounted(() => {
  mapHandle?.destroy()
  mapHandle = null
})
</script>

<template>
  <ul
    class="fr-btns-group fr-btns-group--inline-sm justice-buttons"
    role="group"
    aria-label="Type de juridiction"
  >
    <li v-for="layer in layers" :key="layer.id">
      <button
        type="button"
        class="fr-btn"
        :class="{ 'fr-btn--secondary': selected !== layer.id }"
        :aria-pressed="selected === layer.id"
        @click="selected = layer.id"
      >
        {{ layer.label }}
      </button>
    </li>
  </ul>
  <div
    ref="container"
    class="justice-map"
    role="application"
    :aria-label="`Carte des ${selectedLayer?.label.toLowerCase() ?? 'juridictions'}`"
  />
</template>

<style scoped>
.justice-buttons {
  margin-bottom: 1rem;
}
</style>
