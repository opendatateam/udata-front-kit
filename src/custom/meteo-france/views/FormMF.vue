<script setup lang="ts">
import config from '@/config'
import type { Resource } from '@datagouv/components'
import { ResourceAccordion } from '@datagouv/components'
import Slider from '@vueform/slider'
import '@vueform/slider/themes/default.css'
import { onMounted, ref, type Ref } from 'vue'
import datasetsIds from '../assets/datasets.json'
import deps from '../assets/deps.json'
import MapComponent from '../components/MapComponent.vue'
import ModalComponent from '../components/MeteoFormModal.vue'
import type { Dataset, Feature, FeatureCollection, Station } from '../types'

type DatasetIds = {
  [pack: string]: Record<string, Dataset>
}

const showLoader = ref(false)
const datasetsIdsTyped: DatasetIds = datasetsIds

const env: 'prod' | 'dev' = config.website.env

const selectedDataPack: Ref<string | null> = ref(null)
const optionsDataPack = ref(Object.keys(datasetsIds))
const datasetTitle = ref(null)
const datasetSlug = ref(null)
const indicateurWording = ref('Indicateur')
const selectedDataset: Ref<Dataset | null> = ref(null)
const optionsDataset = ref<string[]>([])

const datasetResources: Ref<Resource[]> = ref([])
const filteredResources: Ref<string[]> = ref([])

const selectedPeriod: Ref<string | null> = ref(null)
const optionsPeriod: Ref<string[]> = ref([])
const showPeriod = ref(false)

const selectedDep: Ref<string | null> = ref(null)
const optionsDeps = ref(deps)
const showDep = ref(false)

const selectedIndicateur: Ref<string | null> = ref(null)
const showIndicateur = ref(false)

const links = [{ to: '/', text: 'Accueil' }, { text: 'Recherche Guidée' }]

const stations: Ref<FeatureCollection> = ref({
  type: 'FeatureCollection',
  features: []
})

const onSelectDataPack = (pack: string | number) => {
  selectedDataset.value = null
  showDep.value = false
  showPeriod.value = false
  showIndicateur.value = false
  selectedDep.value = null
  selectedPeriod.value = null
  selectedIndicateur.value = null
  showCustomFilter.value = false
  filteredResources.value = []

  selectedDataPack.value = String(pack)
  optionsDataset.value = Object.keys(datasetsIdsTyped[pack])
  if (pack === 'Données de prévision numérique du temps (PNT)') {
    indicateurWording.value = 'Regroupement'
  } else {
    indicateurWording.value = 'Indicateur'
  }
}

const onSelectDataset = (dataset: string | number) => {
  showLoader.value = true
  showDep.value = false
  showPeriod.value = false
  showIndicateur.value = false
  selectedDep.value = null
  selectedPeriod.value = null
  selectedIndicateur.value = null
  showCustomFilter.value = false

  filteredResources.value = []

  if (selectedDataPack.value) {
    selectedDataset.value = datasetsIdsTyped[selectedDataPack.value][dataset]
    // FIXME: use DatagouvfrAPI
    fetch(
      config.datagouvfr.base_url +
        '/api/1/datasets/' +
        selectedDataset.value[env]
    )
      .then((response) => {
        return response.json()
      })
      .then((data) => {
        datasetTitle.value = data.title
        datasetSlug.value = data.slug
        datasetResources.value = data.resources
        if (selectedDataset.value?.departement) {
          showDep.value = true
        } else if (selectedDataset.value?.id.startsWith('SIM')) {
          const mainResources = datasetResources.value.filter(
            (item) => item.type === 'main'
          )
          let res = mainResources.map((a) => a.title)
          res = res.map((a) => a.split('SIM2_')[1])
          res = [...new Set(res)]
          optionsPeriod.value = res
          showPeriod.value = true
          selectedDep.value = 'No'
        } else if (selectedDataset.value?.indicateur) {
          showIndicateur.value = true
        } else {
          filteredResources.value = datasetResources.value.map((a) => a.title)
        }
        showLoader.value = false
      })
  }
}
const hoveredPoint: Ref<Feature | null> = ref(null)
const mouseX = ref(0)
const mouseY = ref(0)

function handlePointHover(feature: Feature) {
  hoveredPoint.value = feature
}

function handlePointOut() {
  hoveredPoint.value = null
}

function handleMouseMove(event: MouseEvent) {
  mouseX.value = event.pageX + 10 // Offset the X position slightly to avoid overlap with cursor
  mouseY.value = event.pageY + 10 // Offset the Y position slightly to avoid overlap with cursor
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove) // Listen to mouse movements
})

async function fetchStationsGeoJSON(depCode: string) {
  const response = await fetch(
    `https://object.data.gouv.fr/meteofrance/data/stations/stations_${depCode}.geojson`
  )
  const data: FeatureCollection = await response.json()
  stations.value = data
}

function filterOpenStation() {
  mapPoints.value = filterGeoJSONOpen(stations.value)
  isMapFiltered.value = !isMapFiltered.value
}

function filterGeoJSONOpen(geojson: FeatureCollection): FeatureCollection {
  if (isMapFiltered.value) {
    return geojson
  } else {
    const filteredGeoJSON: FeatureCollection = {
      type: 'FeatureCollection',
      features: []
    }

    geojson.features.forEach((feature) => {
      if (!feature.properties.DATFERM) {
        filteredGeoJSON.features.push(feature)
      }
    })

    return filteredGeoJSON
  }
}

function getCsv(url: string) {
  showModal.value = true
  window.location.href = url
}

function copyToClipboard(url: string) {
  navigator.clipboard.writeText(url)
  copyText.value = 'Lien copié !'
}

async function onSelectDep(event: Event) {
  optionsPeriod.value = []
  selectedPeriod.value = null
  selectedDep.value = (event.target as HTMLSelectElement).value
  let res = datasetResources.value.map((a) => a.title)
  res = res.filter((r) => r.includes('departement_' + selectedDep.value))
  res = res.map((a) => a.split('_periode_')[1].split('_')[0].split('.')[0])
  res = [...new Set(res)]
  optionsPeriod.value = res
  showPeriod.value = true
  if (selectedDataPack.value == 'Données climatologiques de base') {
    for (const obj of deps) {
      if (obj.code === selectedDep.value) {
        mapOptions.value = obj
        //mapPoints.value = filterGeoJSONByNumDep(stations, selectedDep.value)
        await fetchStationsGeoJSON(selectedDep.value)
        mapPoints.value = stations.value
        showCustomFilter.value = true
        const splitRanges = optionsPeriod.value.flatMap((range) =>
          range.split('-').map(Number)
        )
        minSlider.value = Math.min(...splitRanges)
        maxSlider.value = Math.max(...splitRanges)
        valuesSlider.value = [minSlider.value, maxSlider.value]
      }
    }
  } else {
    showCustomFilter.value = false
  }
}

function onSelectPeriod(event: Event) {
  selectedPeriod.value = (event.target as HTMLSelectElement).value
  if (!selectedDataset.value?.id.startsWith('SIM')) {
    let res = datasetResources.value.map((a) => a.title)
    res = res.filter((r) => r.includes('departement_' + selectedDep.value))
    filteredResources.value = res.filter((r) =>
      r.includes('periode_' + selectedPeriod.value)
    )
  } else {
    const res = datasetResources.value.map((a) => a.title)
    filteredResources.value = res.filter(
      (r) => selectedPeriod.value && r.includes(selectedPeriod.value)
    )
  }
}

function onSelectIndicateur(event: Event) {
  selectedIndicateur.value = (event.target as HTMLSelectElement).value
  const res = datasetResources.value.map((a) => a.title)
  filteredResources.value = res.filter((r) =>
    r.includes('_' + selectedIndicateur.value)
  )
}

function convertDate(dateStr: string | number | boolean | null) {
  if (!dateStr) return ''
  const dateObj = new Date(String(dateStr))
  const day = String(dateObj.getDate()).padStart(2, '0')
  const month = String(dateObj.getMonth() + 1).padStart(2, '0') // Months are zero-indexed
  const year = dateObj.getFullYear()
  const formattedDate = `${day}/${month}/${year}`
  return formattedDate
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

const postes = ref<Station[]>([])

const handlePostesUpdate = (newPostes: Station[]) => {
  postes.value = newPostes
}

const showCustomFilter = ref(false)
const isMapFiltered = ref(false)

const minSlider = ref(0)
const maxSlider = ref(100)
const valuesSlider = ref([0, 100])

const copyText = ref('Copier le lien URL direct du fichier CSV')
const showModal = ref(false)
const modalMessage = ref(
  'Le lancement du téléchargement peut prendre un moment. Patientez svp...'
)

const getAPIUrl = (endpoint: string) => {
  const datasetId = selectedDataset.value
    ? selectedDataset.value.id.toLowerCase()
    : ''
  const postesQuery = postes.value.map((post) => post.id).join(',')
  return `https://meteo-api.data.gouv.fr/api/clim/base_${datasetId}${endpoint}/${selectedDep.value}/csv/?num_postes=${postesQuery}&anneemin=${valuesSlider.value[0]}&anneemax=${valuesSlider.value[1]}`
}
</script>

<template>
  <div class="fr-container">
    <DsfrBreadcrumb class="fr-mb-1v" :links="links" />
  </div>
  <div class="fr-container fr-mb-4w">
    <h1 class="fr-mb-2v">Recherche guidée</h1>
    <p>Utiliser ce formulaire pour trouver un fichier en particulier.</p>
    <DsfrSelect
      :model-value="selectedDataPack"
      :options="optionsDataPack"
      @update:model-value="onSelectDataPack"
    >
      <template #label>Quelle thématique de données ?</template>
    </DsfrSelect>

    <DsfrSelect
      v-if="selectedDataPack"
      :options="optionsDataset"
      @update:model-value="onSelectDataset"
    >
      <template #label>Quelles données ?</template>
    </DsfrSelect>

    <div v-if="selectedDataset && showDep" class="select-classic">
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
    <div v-if="showCustomFilter">
      <h4>Téléchargement par station</h4>
      <p>
        Sélectionner les stations désirées en cliquant sur les points de la
        carte
      </p>
      <button type="button" class="fr-btn" @click="filterOpenStation()">
        {{
          isMapFiltered
            ? 'Voir toutes les stations'
            : "Filtrer sur les stations encore ouvertes aujourd'hui"
        }}
      </button>
      <MapComponent
        :options="mapOptions"
        :points="mapPoints"
        @update:postes="handlePostesUpdate"
        @point-hover="handlePointHover"
        @point-out="handlePointOut"
      />
      <div
        v-if="hoveredPoint"
        class="hover-info"
        :style="{ top: `${mouseY}px`, left: `${mouseX}px` }"
      >
        <div>
          Station <b>{{ hoveredPoint.properties.NOM_USUEL }}</b>
        </div>
        <div>
          N° Poste : <b>{{ hoveredPoint.properties.NUM_POSTE }}</b>
        </div>
        <div>
          Commune :
          <b
            >{{ hoveredPoint.properties.COMMUNE }}
            <span v-if="hoveredPoint.properties.LIEU_DIT"
              >({{ hoveredPoint.properties.LIEU_DIT }})</span
            ></b
          >
        </div>
        <div>
          Ouvert le : <b>{{ convertDate(hoveredPoint.properties.DATOUVR) }}</b>
        </div>
        <div v-if="hoveredPoint.properties.DATFERM">
          Fermé le : <b>{{ convertDate(hoveredPoint.properties.DATFERM) }}</b>
        </div>
      </div>

      <br />

      <div v-if="postes.length > 0">
        Vous avez sélectionné les stations :
        <span v-for="item in postes" :key="item.id">{{ item.name }} ; </span>
      </div>
      <br />
      <p>Sélectionner la période (5 ans maximum) :</p>
      <Slider
        v-model="valuesSlider"
        :min="minSlider"
        :max="maxSlider"
        class="slider-dsfr"
      />
      <br />
      <div v-if="valuesSlider[1] - valuesSlider[0] > 5">
        ⚠️ Attention, les exports automatiques sont limités à 5 ans maximum.
        Réduisez la période ci-dessus.
      </div>
      <div v-if="postes.length == 0">
        ⚠️ Attention, vous devez sélectionner au moins une station ci-dessus.
      </div>
      <div v-if="postes.length > 0 && valuesSlider[1] - valuesSlider[0] <= 5">
        <span v-if="selectedDataset && selectedDataset.id == 'QUOT'">
          <button
            type="button"
            class="fr-btn"
            @click="
              getCsv(
                'https://meteo-api.data.gouv.fr/api/clim/base_' +
                  (selectedDataset ? selectedDataset.id.toLowerCase() : '') +
                  '_vent/' +
                  selectedDep +
                  '/csv/?num_postes=' +
                  postes.map((post) => post.id).join(',') +
                  '&anneemin=' +
                  valuesSlider[0] +
                  '&anneemax=' +
                  valuesSlider[1]
              )
            "
          >
            Télécharger les données "Précipitations-Température-Vent" en CSV
          </button>
          &nbsp;&nbsp;
          <button
            type="button"
            class="fr-btn fr-btn--secondary"
            @click="copyToClipboard(getAPIUrl('_vent'))"
          >
            {{ copyText }}
          </button>
          <br /><br />
          <button
            type="button"
            class="fr-btn"
            @click="getCsv(getAPIUrl('_autres'))"
          >
            Télécharger les données "Autres paramètres" en CSV
          </button>
          &nbsp;&nbsp;
          <button
            type="button"
            class="fr-btn fr-btn--secondary"
            @click="copyToClipboard(getAPIUrl('_autres'))"
          >
            {{ copyText }}
          </button>
        </span>
        <span v-else>
          <button type="button" class="fr-btn" @click="getCsv(getAPIUrl(''))">
            Télécharger les données en CSV
          </button>
          &nbsp;&nbsp;
          <button
            type="button"
            class="fr-btn fr-btn--secondary"
            @click="copyToClipboard(getAPIUrl(''))"
          >
            {{ copyText }}
          </button>
        </span>
        <ModalComponent
          :show="showModal"
          :message="modalMessage"
          @close="showModal = false"
        />
      </div>
      <br /><br />
      <h4>Téléchargement par période</h4>
      <p>
        Vous pouvez également télécharger les fichiers par grand groupes de
        période.
      </p>
    </div>

    <div v-if="selectedDep && showPeriod" class="select-classic">
      <label>Quelle période ?</label>
      <select class="fr-select" @change="onSelectPeriod($event)">
        <option hidden>Choisir une option</option>
        <option v-for="period in optionsPeriod" :key="period" :value="period">
          Période {{ period }}
        </option>
      </select>
    </div>

    <div v-if="selectedDataset && showIndicateur" class="select-classic">
      <label>Quel {{ indicateurWording }} ?</label>
      <select class="fr-select" @change="onSelectIndicateur($event)">
        <option hidden>Choisir une option</option>
        <option
          v-for="item in selectedDataset['indicateursListe']"
          :key="item['code']"
          :value="item['code']"
        >
          {{ indicateurWording }} {{ item['name'] }}
        </option>
      </select>
    </div>

    <div v-if="filteredResources.length > 0">
      <br />
      <h3>Téléchargez les données</h3>
      <p>
        Basé sur vos filtres, les fichiers correspondants sont présentés
        ci-dessous.
      </p>
      <p>
        Si vous souhaitez consulter le jeu de données complet,
        <a
          :href="'https://' + config.website.title + '/datasets/' + datasetSlug"
          >{{ datasetTitle }}
          <span
            class="fr-icon-external-link-line"
            aria-hidden="true"
          ></span> </a
        >.
      </p>
      <p>
        Si vous souhaitez récupérer automatiquement les données, vous pouvez
        appeler l'API data.gouv.fr et filtrer les résultats sur les ressources
        et leurs noms.
      </p>
      <div>
        <div v-if="selectedIndicateur" class="code-api">
          {{
            'https://www.data.gouv.fr/api/2/datasets/' +
            datasetSlug +
            '/resources/?q=' +
            selectedIndicateur
          }}
        </div>
        <div v-else class="code-api">
          {{
            'https://www.data.gouv.fr/api/2/datasets/' +
            datasetSlug +
            '/resources/'
          }}
        </div>
      </div>
      <br />
      <br />
      <h5>Fichiers</h5>
      <div
        v-for="item in datasetResources"
        :key="item['id']"
        class="datagouv-components"
      >
        <ResourceAccordion
          v-if="
            selectedDataset &&
            item['id'] != 'b1d97b5b-cb0e-4991-90be-4c8a16a6c2a7' &&
            filteredResources.includes(item['title']) &&
            item['type'] == 'main'
          "
          :dataset-id="selectedDataset[env]"
          :resource="item"
        />
      </div>

      <br />
      <h5>Documentation</h5>
      <div
        v-for="item in datasetResources"
        :key="item['id']"
        class="datagouv-components"
      >
        <span
          v-if="
            selectedDataset && ['LSH', 'SQR'].includes(selectedDataset['id'])
          "
        >
          <ResourceAccordion
            v-if="
              item['title'].includes('_' + selectedIndicateur + '_') &&
              item['type'] == 'documentation'
            "
            :dataset-id="selectedDataset[env]"
            :resource="item"
          />
        </span>
        <span v-else>
          <ResourceAccordion
            v-if="selectedDataset && item['type'] == 'documentation'"
            :dataset-id="selectedDataset[env]"
            :resource="item"
          />
        </span>
      </div>
    </div>

    <div v-if="showLoader">
      <img src="../assets/loader.gif" width="50" />
    </div>
  </div>
</template>

<style scoped>
.select-classic {
  margin-bottom: 20px;
}
.code-api {
  word-wrap: break-word;
  background-color: #ebebeb;
  padding: 20px;
  margin-top: 20px;
  border-radius: 5px;
}

.slider-dsfr {
  --slider-connect-bg: #3558a2;
  --slider-tooltip-bg: #3558a2;
  --slider-handle-ring-color: #3558a230;
}

.hover-info {
  position: absolute;
  background: white;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  max-width: 300px;
  font-size: 11px;
}
</style>
