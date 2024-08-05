<template>
  <div class="map-wrapper">
    <div ref="mapContainer" class="map-container"></div>
  </div>
</template>

<script lang="ts">
import maplibregl, { StyleSpecification } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { defineComponent, onMounted, ref, watch } from 'vue'

import styleVector from '../assets/style.json'

interface Point {
  type: string
  geometry: {
    type: string
    coordinates: [number, number]
  }
  properties: {
    NUM_POSTE: string
    NOM_USUEL: string
  }
}

interface MapOptions {
  zoom: number
  minx: number
  miny: number
  maxx: number
  maxy: number
}

interface Station {
  id: string
  name: string
}

export default defineComponent({
  name: 'MapComponent',
  props: {
    options: {
      type: Object as () => MapOptions,
      required: true
    },
    points: {
      type: Array as () => Point[],
      required: true
    }
  },
  emits: ['update:postes'],
  setup(props, { emit }) {
    const mapContainer = ref<HTMLDivElement | null>(null)
    let map: maplibregl.Map | null = null
    const markers: maplibregl.Marker[] = []
    const postes = ref<Station[]>([])

    const initializeMap = () => {
      if (mapContainer.value) {
        map = new maplibregl.Map({
          container: mapContainer.value,
          style: styleVector as StyleSpecification,
          zoom: props.options.zoom,
          center: [
            (props.options.minx + props.options.maxx) / 2,
            (props.options.miny + props.options.maxy) / 2
          ]
        })

        map.fitBounds(
          [
            [props.options.minx, props.options.miny],
            [props.options.maxx, props.options.maxy]
          ],
          {
            animate: false
          }
        )

        map.on('load', function () {
          addPointsToMap()
        })
      }
    }

    const onMarkerClick = (point: any) => {
      if (point.properties && point.properties['NUM_POSTE']) {
        if (
          postes.value.some((item) => item.id === point.properties['NUM_POSTE'])
        ) {
          postes.value = postes.value.filter(
            (item) => item.id !== point.properties['NUM_POSTE']
          )
        } else {
          postes.value.push({
            id: point.properties['NUM_POSTE'],
            name: point.properties['NOM_USUEL']
          })
        }
        emit('update:postes', postes.value)
      }
    }

    const createCustomMarker = (color: string) => {
      const el = document.createElement('div')
      el.className = 'custom-marker'
      el.style.backgroundColor = color
      el.style.width = '20px'
      el.style.height = '20px'
      el.style.borderRadius = '50%'
      el.style.cursor = 'pointer'
      return el
    }

    const addPointsToMap = () => {
      if (
        map &&
        props.points &&
        props.points.features &&
        props.points.features.length > 0
      ) {
        props.points.features.forEach((point) => {
          const markerElement = createCustomMarker('#AAAAAA')
          const marker = new maplibregl.Marker({ element: markerElement })
            .setLngLat([
              point.geometry.coordinates[0],
              point.geometry.coordinates[1]
            ])
            .addTo(map)
          markers.push(marker)
          markerElement.addEventListener('click', () => {
            if (
              postes.value.some(
                (item) => item.id === point.properties['NUM_POSTE']
              )
            ) {
              markerElement.style.backgroundColor = '#AAAAAA'
            } else {
              markerElement.style.backgroundColor = '#3558A2'
            }
            onMarkerClick(point)
          })
        })
      }
    }

    onMounted(() => {
      initializeMap()
    })

    watch(
      () => props.options,
      (newOptions) => {
        if (map) {
          map.remove()
          map = new maplibregl.Map({
            container: mapContainer.value!,
            style: styleVector as StyleSpecification,
            zoom: newOptions.zoom,
            center: [
              (newOptions.minx + newOptions.maxx) / 2,
              (newOptions.miny + newOptions.maxy) / 2
            ]
          })

          map.on('load', function () {
            map.fitBounds(
              [
                [newOptions.minx, newOptions.miny],
                [newOptions.maxx, newOptions.maxy]
              ],
              {
                animate: false
              }
            )

            addPointsToMap()
          })
        }
      }
    )

    return {
      mapContainer
    }
  }
})
</script>

<style>
.map-wrapper {
  width: 100%;
  height: 600px;
  margin: auto;
  margin-top: 20px;
  position: relative;
  overflow: hidden;
}

.map-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.custom-marker {
  border: 2px solid white;
}
</style>
