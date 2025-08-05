/*!
 * @ecolabdata/tabular-dataviz
 * Interactive data visualization for data.gouv.fr tabular datasets
 */

// Import Choices.js CSS
import 'choices.js/public/assets/styles/choices.min.css'

// Core modules
export { makeChart } from './core/chart.mjs'
export { makeDatasets } from './core/datasets.mjs'
export { fetchData } from './core/fetch.mjs'
export {
  formatBigNumber,
  formatData,
  numberWithCommas
} from './core/format.mjs'

// DOM utilities
export * from './core/dom.mjs'

// Components
export { makeAxesCheckboxes } from './components/axes.mjs'
export { makeMeshDropdown } from './components/mesh.mjs'
export { makeTerritoryDropDown } from './components/territory.mjs'

// Constants
export * from './core/enums.mjs'

// Territory data
export { COMMUNES } from './data/territories/communes.mjs'
export { DEPARTEMENTS } from './data/territories/departements.mjs'
export { EPCIS } from './data/territories/epcis.mjs'
export { REGIONS } from './data/territories/regions.mjs'

// Main initialization function
import { makeMeshDropdown } from './components/mesh.mjs'
import { makeTerritoryDropDown } from './components/territory.mjs'
import {
  getDataVizContainers,
  getFiles,
  getFilesFromContainer,
  getIndicatorFromContainer
} from './core/dom.mjs'

function verifyParams(container) {
  const mandatoryCustomFields = ['indicatorId', 'files', 'indicator']
  mandatoryCustomFields.forEach((field) => {
    if (!(field in container.dataset)) {
      throw new Error(`Le container doit avoir un attribut '${field}'`)
    }
  })

  const indicator = getIndicatorFromContainer(container)
  const mandatoryIndicatorAttributes = [
    'id',
    'unite',
    'summable',
    'enableVisualisation'
  ]
  mandatoryIndicatorAttributes.forEach((field) => {
    if (!(field in indicator)) {
      throw new Error(`L'indicateur doit avoir un attribut '${field}'`)
    }
  })

  const files = getFilesFromContainer(container)
  const mandatoryFileAttributes = ['mesh', 'valueColumn', 'axes']
  mandatoryFileAttributes.forEach((field) => {
    files.forEach((file) => {
      if (!(field in file)) {
        throw new Error(`Les fichiers doivent avoir un attribut '${field}'`)
      }
    })
  })
}

export function initializeVisualization(options = {}) {
  const { timeout = 100 } = options

  setTimeout(() => {
    getDataVizContainers().forEach((container) => {
      try {
        verifyParams(container)
        const indicator = getIndicatorFromContainer(container)

        if (!indicator.enableVisualisation) {
          return
        }

        let html = `
        <div class="dropdowns">
          <div class="geo-dropdowns">
            <div id="mesh-dropdown-container-${indicator.id}" class="mesh-dropdown"></div>
            <div id="territory-dropdown-container-${indicator.id}" class="territory-dropdown"></div>
          </div>
          <div id="axes-dropdown-container-${indicator.id}" class="axes-dropdown"></div>
        </div>
        <div style="height:300px; width: 100%;" class="canvas-container">
          <canvas id="chart-${indicator.id}"></canvas>
          <p class="help">M: mille, MM: million, MMM: milliard</p>
        </div>
        <div id="one-year-value-${indicator.id}" class="one-year-value hidden"></div>
        `

        container.innerHTML = html
        const files = getFiles(indicator)
        const meshes = files.map((f) => f.mesh)
        makeMeshDropdown(indicator, meshes)
        makeTerritoryDropDown(indicator)
      } catch (error) {
        console.error('Error initializing visualization:', error)
        container.innerHTML = `<div class="error">Erreur lors de l'initialisation: ${error.message}</div>`
      }
    })
  }, timeout)
}

// Legacy global function for backward compatibility
if (typeof window !== 'undefined') {
  window.makeIndicatorVisualisation = initializeVisualization
}
