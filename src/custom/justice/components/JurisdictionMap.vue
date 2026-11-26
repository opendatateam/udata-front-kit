<script lang="ts" setup>
import { type GeoJSONSource, type MapGeoJSONFeature } from 'maplibre-gl'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

import { BLUE, PURPLE } from '@/custom/justice/utils/chartTheme'
import {
  bindHoverPopup,
  mountFranceMap,
  popupLines,
  type FranceMap
} from '@/custom/justice/utils/franceMap'
import { metroBounds, type MapFeature } from '@/custom/justice/utils/geojson'

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
let mapHandle: FranceMap | null = null
let clearHover = () => {}

const selectedLayer = computed(
  () =>
    props.layers.find((layer) => layer.id === selected.value) ?? props.layers[0]
)

function currentFeatures(): MapFeature[] {
  return selectedLayer.value?.features ?? []
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
  if (!mapHandle) return
  const { map } = mapHandle
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
  clearHover = bindHoverPopup(mapHandle, 'courts', 'courts-fill', popupContent)
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
    class="fr-btns-group fr-btns-group--inline-sm fr-mb-2w"
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
    class="france-map"
    role="application"
    :aria-label="`Carte des ${selectedLayer?.label.toLowerCase() ?? 'juridictions'}`"
  />
</template>
