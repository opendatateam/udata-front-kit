import { makeMeshDropdown } from '../components/mesh.mjs'
import { makeTerritoryDropDown } from '../components/territory.mjs'
import {
  getDataVizContainers,
  getFiles,
  getIndicatorFromContainer
} from './dom.mjs'

function verifyParams(container) {
  /*
   ** Fonction pour vérifier que les attributs data-* du container soient bien renseignés.
   ** Si ce n'est pas le cas, le module rejette une erreur et ne s'execute pas.
   */
  const mandatoryCustomFields = ['indicator-id', 'files', 'indicator']
  mandatoryCustomFields.forEach((field) => {
    if (!(field in container.dataset)) {
      throw `Le container doit avoir un attribut '${field}'`
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
      throw `L'indicateur doit avoir un attribut '${field}'`
    }
  })

  const files = getFilesFromContainer(container)
  const mandatoryFileAttributes = ['mesh', 'valueColumn', 'axes']
  mandatoryFileAttributes.forEach((field) => {
    files.forEach((file) => {
      if (!(field in file)) {
        throw `Les fichiers doivent avoir un attribut '${field}'`
      }
    })
  })
}

function makeIndicatorVisualisation() {
  // petit timeout pour être sûr que le DOM a bien chargé.
  setTimeout(() => {
    // C'est possible que la page peut contenir plusieurs container `data-viz` (un par indicateur)
    // C'est pour cela que tous les IDs contiendront l'ID de l'indicateur.
    getDataVizContainers().forEach((container) => {
      verifyParams(container)
      const indicator = getIndicatorFromContainer(container)
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
      // Lorsqu'on créé la dropdown des territoires, le premier territoire est selectionné
      // et l'appel des données est effectué
      makeTerritoryDropDown(indicator)
    })
  }, 100)
}

// On expose cette fonction dans window pour qu'elle soit invoquée dans la plateforme hôte
window.makeIndicatorVisualisation = makeIndicatorVisualisation
