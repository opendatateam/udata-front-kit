/*
 ** Fichier pour appeler l'API tabular de data.gouv.fr
 ** https://github.com/datagouv/api-tabular
 */

import { makeAxesCheckboxes } from '../components/axes.mjs'
import { makeChart } from './chart.mjs'
import {
  getCurrentMesh,
  getCurrentTerritory,
  getFiles,
  getTabularApiUrl,
  saveInTheDOM
} from './dom.mjs'
import { GEOCOLUMNS, YEAR_COLUMN } from './enums.mjs'
import { formatData } from './format.mjs'

async function fetchPage(url, allData) {
  /*
   ** Fonction récursive pour prendre en compte la pagination de l'API
   */
  const response = await fetch(url)
  if (response.ok) {
    const body = await response.json()
    const data = body.data
    if (data && data.length > 0) {
      allData = allData.concat(data)
      const nextUrl = body.links?.next
      if (nextUrl) {
        allData = fetchPage(nextUrl, allData)
      }
    }
  } else {
    console.error(
      'Error fetching data from tabular API at url',
      url,
      response.status,
      await response.text()
    )
  }
  return allData
}

function getGeoCondition(indicator, mesh) {
  // Si la maille est nationale on ne filtre pas sur un territoire
  if (mesh == 'fr') {
    return ''
  }
  const geocode = getCurrentTerritory(indicator)
  const geoColumn = GEOCOLUMNS[mesh]
  const condition = `${geoColumn}__exact=${geocode}&`
  return condition
}

export async function fetchData(indicator) {
  const mesh = getCurrentMesh(indicator)
  const files = getFiles(indicator)
  const file = files.find((f) => f.mesh === mesh)
  const geoCondition = getGeoCondition(indicator, mesh)
  const baseUrl =
    getTabularApiUrl(indicator) || 'https://tabular-api.data.gouv.fr'
  const path = `${baseUrl}/api/resources/${file.id}/data/`
  const url = `${path}?${geoCondition}${YEAR_COLUMN}__sort=asc`
  let allData = []
  allData = await fetchPage(url, allData)
  const formatedData = formatData(allData, file)
  // On sauvegarde les données et les axes directement dans le DOM (sous forme de script JSON)
  // Ce qui permettra de ne pas effectuer de nouvelles requêtes à l'API si l'utilisateur filtre sur les axes
  saveInTheDOM(indicator, 'data', formatedData)
  saveInTheDOM(indicator, 'axes', Object.keys(file.axes))
  // Une fois qu'on a les données, on peut remplir les valeurs possibles des axes
  // Cela permet de ne pas afficher des valeurs d'axe absentes du jeu de données courant
  makeAxesCheckboxes(indicator, file, formatedData)
  makeChart(indicator)
}
