<script setup lang="ts">
import { ResourceAccordion } from '@etalab/data.gouv.fr-components'
import { computed, ref } from 'vue'

import config from '@/config'

import datasetsIds from '../assets/datasets.json'
import deps from '../assets/deps.json'

const selectItems = ref([])

let selectedDataPack = ref(null)
const optionsDataPack = ref(Object.keys(datasetsIds))

const onSelectDataPack = (pack) => {
  selectedDataset.value = null
  showDep.value = false
  showPeriod.value = false
  showIndicateur.value = false
  selectedDep.value = null
  selectedPeriod.value = null
  selectedIndicateur.value = null
  filteredResources.value = []

  selectedDataPack.value = pack
  optionsDataset = Object.keys(datasetsIds[pack])
}

let selectedDataset = ref(null)
let optionsDataset = ref([])

const onSelectDataset = (dataset) => {
  showLoader.value = true
  showDep.value = false
  showPeriod.value = false
  showIndicateur.value = false
  selectedDep.value = null
  selectedPeriod.value = null
  selectedIndicateur.value = null

  filteredResources.value = []

  selectedDataset.value = datasetsIds[selectedDataPack.value][dataset]
  fetch(
    config.datagouvfr.base_url +
      '/api/1/datasets/' +
      selectedDataset.value['dev']
  )
    .then((response) => {
      return response.json()
    })
    .then((data) => {
      datasetResources = data['resources']
      if (selectedDataset.value['departement']) {
        showDep.value = true
      } else if (selectedDataset.value['id'] == 'SIM') {
        let res = datasetResources.map((a) => a.title)
        res = res.map((a) =>
          a.split('SIM2_')[1].split('.')[0].replace('_', '-')
        )
        res = [...new Set(res)]
        optionsPeriod.value = res
        showPeriod.value = true

        selectedDep.value = 'No'
      } else if (selectedDataset.value['indicateur']) {
        showIndicateur.value = true
      }
      showLoader.value = false
    })
}

let selectedDep = ref(null)
let optionsDeps = ref(deps)
let showDep = ref(false)

function onSelectDep(event) {
  optionsPeriod.value = []
  selectedPeriod.value = null
  selectedDep.value = event.target.value
  let res = datasetResources.map((a) => a.title)
  res = res.filter((r) => r.includes('departement_' + selectedDep.value))
  res = res.map((a) => a.split('_periode_')[1].split('_')[0].split('.')[0])
  res = [...new Set(res)]
  optionsPeriod.value = res
  showPeriod.value = true
}

let selectedPeriod = ref(null)
let optionsPeriod = ref([])
let showPeriod = ref(false)

function onSelectPeriod(event) {
  selectedPeriod.value = event.target.value
  if (selectedDataset.value['id'] != 'SIM') {
    let res = datasetResources.map((a) => a.title)
    res = res.filter((r) => r.includes('departement_' + selectedDep.value))
    filteredResources.value = res.filter((r) =>
      r.includes('periode_' + selectedPeriod.value)
    )
  } else {
    let res = datasetResources.map((a) => a.title)
    filteredResources.value = res.filter((r) =>
      r.includes(selectedPeriod.value.replace('-', '_'))
    )
  }
}

let selectedIndicateur = ref(null)
let optionsIndicateur = ref([])
let showIndicateur = ref(false)

function onSelectIndicateur(event) {
  selectedIndicateur.value = event.target.value
  let res = datasetResources.map((a) => a.title)
  filteredResources.value = res.filter((r) =>
    r.includes('_' + selectedIndicateur.value)
  )
}

let datasetResources = ref([])
let filteredResources = ref([])

const showLoader = ref(false)
</script>

<template>
  <div class="fr-container fr-mt-4w fr-mb-4w">
    <h1>Recherche guidée</h1>
    <p>Utilisez ce formulaire pour trouver un fichier en particulier.</p>
    <DsfrSelect
      :model-value="selectedDataPack"
      :options="optionsDataPack"
      @update:modelValue="onSelectDataPack"
    >
      <template #label>Quelles pack de données ?</template>
    </DsfrSelect>

    <DsfrSelect
      v-if="selectedDataPack"
      :options="optionsDataset"
      @update:modelValue="onSelectDataset"
    >
      <template #label>Quelles données ?</template>
    </DsfrSelect>

    <div class="select-classic" v-if="selectedDataset && showDep">
      <label>Quel département ?</label>
      <select class="fr-select" @change="onSelectDep($event)">
        <option hidden>Choisir une option</option>
        <option
          v-for="dep in optionsDeps"
          v-bind:key="dep['code']"
          :value="dep['code']"
        >
          {{ dep['name'] }} ({{ dep['code'] }})
        </option>
      </select>
    </div>

    <div class="select-classic" v-if="selectedDep && showPeriod">
      <label>Quelle période ?</label>
      <select class="fr-select" @change="onSelectPeriod($event)">
        <option hidden>Choisir une option</option>
        <option
          v-for="period in optionsPeriod"
          v-bind:key="period"
          :value="period"
        >
          Période {{ period }}
        </option>
      </select>
    </div>

    <div class="select-classic" v-if="selectedDataset && showIndicateur">
      <label>Quelle indicateur ?</label>
      <select class="fr-select" @change="onSelectIndicateur($event)">
        <option hidden>Choisir une option</option>
        <option
          v-for="item in selectedDataset['indicateursListe']"
          v-bind:key="item"
          :value="item"
        >
          Indicateur {{ item }}
        </option>
      </select>
    </div>

    <div v-if="filteredResources.length > 0">
      <br />
      <h3>Téléchargez les données</h3>

      <br />
      <h5>Fichiers</h5>
      <div
        class="datagouv-components"
        v-for="item in datasetResources"
        v-bind:key="item['id']"
      >
        <ResourceAccordion
          v-if="
            filteredResources.includes(item['title']) && item['type'] == 'main'
          "
          :datasetId="selectedDataset['dev']"
          :resource="item"
        />
      </div>

      <br />
      <h5>Documentation</h5>
      <div
        class="datagouv-components"
        v-for="item in datasetResources"
        v-bind:key="item['id']"
      >
        <span v-if="['LSH', 'SQR'].includes(selectedDataset['id'])">
          <ResourceAccordion
            v-if="
              item['title'].includes('_' + selectedIndicateur + '_') &&
              item['type'] == 'documentation'
            "
            :datasetId="selectedDataset['dev']"
            :resource="item"
          />
        </span>
        <span v-else>
          <ResourceAccordion
            v-if="item['type'] == 'documentation'"
            :datasetId="selectedDataset['dev']"
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

<style scoped lang="scss">
.select-classic {
  margin-bottom: 20px;
}
</style>
