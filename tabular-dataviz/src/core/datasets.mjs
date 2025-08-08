/**
 * Fichier pour créer les datasets qu'on envoie à Chart.js
 * un dataset est une liste de listes
 * toutes les sous-listes représentent une ligne dans le graphique
 */

import {
  getCurrentAxeValues,
  getGroupAxeSwitch,
  getSavedDataFromDOM
} from './dom.mjs'

function isAxeGrouped(indicator, axe) {
  const groupSwitch = getGroupAxeSwitch(indicator, axe)
  // si l'indicateur n'est pas sommable il n'y a pas les switch dans le DOM et la fonction ne renvoie pas true
  return groupSwitch?.checked
}

function groupDataByYear(items) {
  const grouped = items.reduce((acc, item) => {
    if (!acc[item.year]) {
      acc[item.year] = 0
    }
    acc[item.year] += item.value
    return acc
  }, {})
  return Object.entries(grouped).map(([year, value]) => ({
    x: Number(year),
    y: value
  }))
}

function getGroupedAxes(indicator, axesNames) {
  return axesNames.filter((axe) => isAxeGrouped(indicator, axe))
}

function getNonGroupedAxes(indicator, axesNames) {
  return axesNames.filter((axe) => !isAxeGrouped(indicator, axe))
}

function filterDataByCurrentAxes(indicator, axesNames, data) {
  /**
   * On filtre sur les valeurs des axes choisies par l'utilisateur
   */
  const currentAxes = Object.fromEntries(
    axesNames.map((axe) => {
      const values = getCurrentAxeValues(indicator, axe)
      return [axe, values]
    })
  )
  return data.filter((d) =>
    Object.entries(currentAxes).every(([axe, values]) =>
      values.includes(d[axe])
    )
  )
}

function splitDataByAxes(indicator, axesNames, data) {
  /**
   * Comportement de groupement ou non des valeurs selon un ou plusieurs axes
   * Si l'indicateur n'est pas sommable on fait une ligne par couple d'axes (par exemple une ligne pour "tertiaire - électricité")
   * Si l'indicateur est sommable, des switchs sous les axes sont affichés pour demander à l'utilisateur s'il veut grouper les lignes de l'axe concerné
   * Par exemple si on veut afficher seulement une ligne pour tout le secteur tertiaire alors qu'un axe "type d'énergie" existe avec deux valeurs sélectionnées.
   */
  const groupedAxes = getGroupedAxes(indicator, axesNames)
  const nonGroupedAxes = getNonGroupedAxes(indicator, axesNames)

  const groupsMap = new Map()

  for (const item of data) {
    const key = nonGroupedAxes.map((axe) => item[axe]).join(' - ') || 'Total'

    if (!groupsMap.has(key)) {
      groupsMap.set(key, [])
    }
    groupsMap.get(key).push(item)
  }

  return Array.from(groupsMap.entries()).map(([key, items]) => {
    let groupedData = items
    if (groupedAxes.length > 0) {
      // On groupe par année (x) uniquement : on somme les valeurs
      groupedData = groupDataByYear(items)
    } else {
      // Sinon, on garde les valeurs originales
      groupedData = items.map((item) => ({ x: item.year, y: item.value }))
    }

    return {
      label: key,
      data: groupedData
    }
  })
}

export function makeDatasets(indicator) {
  const axesNames = getSavedDataFromDOM(indicator, 'axes')
  let data = getSavedDataFromDOM(indicator, 'data')
  if (axesNames.length > 0) {
    data = filterDataByCurrentAxes(indicator, axesNames, data)
    return splitDataByAxes(indicator, axesNames, data)
  }
  // si il n'y a pas d'axes pour l'indicateur
  // on afficher qu'une seule ligne dans tous les cas
  return [
    {
      label: '',
      data: data.map((d) => ({ x: d.year, y: d.value }))
    }
  ]
}
