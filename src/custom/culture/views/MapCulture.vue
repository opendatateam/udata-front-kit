<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue'
import datasets from '../assets/datasets.json'
import deps from '../assets/deps.json'
import MapComponent from '../components/MapComponent.vue'
import type { FeatureCollection } from '../types'

const links = [{ to: '/', text: 'Accueil' }, { text: 'Cartes' }]
const selectedDataset: Ref<string | null> = ref(null)
const selectedDep: Ref<string | null> = ref(null)
const optionsDeps = ref(deps)

const optionsDatasets = ref(datasets.map((item) => item.name))

async function onSelectDataset(dataset: string) {
  selectedDataset.value = dataset
}

function getNextTwoChar(value: string): string {
  if (/^\d+$/.test(value)) {
    return String(parseInt(value, 10) + 1).padStart(2, '0')
  }

  let nextValue = (parseInt(value, 36) + 1).toString(36).toUpperCase()

  return nextValue.padStart(2, '0')
}

function removeInvalidCoordinatesXY(data, coordinates_xy) {
  return data.filter(
    (item) =>
      item[coordinates_xy] !== null && item[coordinates_xy] !== undefined
  )
}

function removeInvalidCoordinatesXorY(data, coordinates_x, coordinates_y) {
  let data_filtered = data.filter(
    (item) => item[coordinates_x] !== null && item[coordinates_x] !== undefined
  )
  return data_filtered.filter(
    (item) => item[coordinates_y] !== null && item[coordinates_y] !== undefined
  )
}

async function fetchAllData(depCode: string) {
  let data = datasets.find((item) => item.name === selectedDataset.value)
  let allData: any[] = []
  let url = `https://tabular-api.data.gouv.fr/api/resources/${data?.resource_id}/data/?${data?.column_dep}__greater=${depCode}&${data?.column_dep}__less=${getNextTwoChar(depCode)}&page=1&page_size=50`

  try {
    while (url) {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`)

      const result = await response.json()
      allData = allData.concat(result.data)

      url = result.links?.next || null
    }
    if (data?.coordinates_xy) {
      allData = removeInvalidCoordinatesXY(allData, data?.coordinates_xy)
    }
    if (data?.coordinates_x && data?.coordinates_y) {
      allData = removeInvalidCoordinatesXorY(
        allData,
        data?.coordinates_x,
        data?.coordinates_y
      )
    }
    return allData
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error)
    return []
  }
}

async function onSelectDep(event: Event) {
  let dataset = datasets.find((item) => item.name === selectedDataset.value)
  selectedDep.value = (event.target as HTMLSelectElement).value
  for (let obj of deps) {
    if (obj.code === selectedDep.value) {
      mapOptions.value = obj
    }
  }
  const data = await fetchAllData(selectedDep.value)
  if (dataset?.coordinates_xy) {
    mapPoints.value = {
      type: 'FeatureCollection',
      features: data.map((item) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: item[dataset?.coordinates_xy]
            .split(', ')
            .map(Number)
            .reverse()
        },
        properties: item
      }))
    }
  }
  if (dataset?.coordinates_x && dataset?.coordinates_y) {
    mapPoints.value = {
      type: 'FeatureCollection',
      features: data.map((item) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [
            item[dataset?.coordinates_x],
            item[dataset?.coordinates_y]
          ]
        },
        properties: item
      }))
    }
  }
}

const configDep = {
  zoom: 6.8,
  minx: 4.7441167394752,
  miny: 44.696067584965,
  maxx: 6.3588423781754,
  maxy: 45.883269928025
}
const mapOptions = ref(configDep)

const mapPoints = ref<FeatureCollection>({
  type: 'FeatureCollection',
  features: []
})

const hoveredPoint = ref(null)
const mouseX = ref(0)
const mouseY = ref(0)

function handlePointClick(feature) {
  hoveredPoint.value = feature.properties
}

function handlePointHover(feature) {
  // hoveredPoint.value = feature
}

function handlePointOut() {
  //hoveredPoint.value = null
}

function handleMouseMove(event: MouseEvent) {
  mouseX.value = event.pageX + 10 // Offset the X position slightly to avoid overlap with cursor
  mouseY.value = event.pageY + 10 // Offset the Y position slightly to avoid overlap with cursor
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove) // Listen to mouse movements
})
</script>

<template>
  <div class="fr-container">
    <DsfrBreadcrumb class="fr-mb-1v" :links="links" />
  </div>
  <div class="fr-container fr-mb-4w">
    <h1 class="fr-mb-2v">Cartes</h1>
    <p>Visualiser sur une carte les données de la plateforme.</p>
    <DsfrSelect
      :model-value="selectedDataset"
      :options="optionsDatasets"
      @update:model-value="onSelectDataset"
    >
      <template #label>Quelle thématique de données ?</template>
    </DsfrSelect>
  </div>

  <div class="fr-container select-classic" v-if="selectedDataset">
    <label>Quel département ?</label>
    <select class="fr-select" @change="onSelectDep($event)">
      <option hidden>Choisir une option</option>
      <option
        v-for="dep in optionsDeps"
        :key="dep['code']"
        :value="dep['code']"
      >
        {{ dep['name'] }} ({{ dep['code'] }})
      </option>
    </select>
  </div>
  <div class="fr-container map-info" v-if="selectedDep">
    <div class="map">
      <MapComponent
        :options="mapOptions"
        :points="mapPoints"
        @update:postes="handlePostesUpdate"
        @point-hover="handlePointHover"
        @point-out="handlePointOut"
        @point-click="handlePointClick"
      />
    </div>
    <div class="info">
      <div v-if="hoveredPoint">
        <div v-for="[key, value] in Object.entries(hoveredPoint)" :key="key">
          <span v-if="value && key != '__id'"
            ><b>{{ key }} :</b> {{ value }}</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-info {
  display: flex;
}
.map {
  width: 70%;
}
.info {
  width: 30%;
  margin-top: 20px;
  margin-left: 10px;
  max-height: 600px;
  overflow-y: auto;
  border: 1px solid #ccc;
  padding: 10px;
}
</style>
