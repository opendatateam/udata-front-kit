<script setup lang="ts">
// FIXME: the resize logic should be upstreamed
import type { GeoJsonObject } from 'geojson'
import type { LatLngBounds, Map } from 'leaflet'
import { onMounted, onUnmounted, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    geojson: GeoJsonObject
    width?: string
    height?: string
  }>(),
  { width: '400px', height: '400px' }
)

const containerRef = ref<HTMLElement | null>(null)
let map: Map | null = null
let ro: ResizeObserver | null = null

onMounted(async () => {
  const L = await import('leaflet')
  if (!containerRef.value) return

  map = L.map(containerRef.value)
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map)

  const geoLayer = L.geoJSON(props.geojson).addTo(map)
  const bounds: LatLngBounds = geoLayer.getBounds()

  let fitted = false
  const fitIfVisible = () => {
    if (!fitted && bounds.isValid() && containerRef.value?.offsetWidth) {
      map?.invalidateSize()
      map?.fitBounds(bounds)
      fitted = true
    }
  }

  fitIfVisible()

  ro = new ResizeObserver(() => {
    map?.invalidateSize()
    fitIfVisible()
  })
  ro.observe(containerRef.value)
})

onUnmounted(() => {
  ro?.disconnect()
  map?.remove()
})
</script>

<template>
  <div
    ref="containerRef"
    :style="{ height: props.height, width: props.width }"
  />
</template>

<style>
@import 'leaflet/dist/leaflet.css';

/* DSFR applies background-image to all [href] elements */
.leaflet-bar a {
  background-image: none;
  min-height: unset;
  padding: 0;
}
</style>
