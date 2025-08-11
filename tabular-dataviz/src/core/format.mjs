/**
 * Fichier pour formater les valeurs des données
 */

import { YEAR_COLUMN } from './enums.mjs'

export function formatBigNumber(n, maxValue = n) {
  /**
   * Utilisé pour l'axe Y du graphique car un grand nombre prend trop de place
   * Utilise les conventions courantes (k pour millier, M pour million, Md pour milliard)
   * L'unité est déterminée par la valeur maximale pour garder la cohérence dans tout le graphe
   */
  if (maxValue < 1000) return n.toString()

  let suffix = ''
  let diviseur = 1

  // Détermine l'unité basée sur la valeur maximale pour une cohérence dans tout le graphe
  if (maxValue >= 1_000_000_000) {
    suffix = 'Md'
    diviseur = 1_000_000_000
  } else if (maxValue >= 1_000_000) {
    suffix = 'M'
    diviseur = 1_000_000
  } else {
    suffix = 'k'
    diviseur = 1000
  }

  let valeur = n / diviseur
  let affichage = Number.isInteger(valeur)
    ? valeur.toString()
    : valeur.toFixed(1).replace('.', ',')

  return `${affichage}${suffix}`
}

export function formatNumber(x) {
  // Utilise la locale courante du navigateur pour formater les nombres
  return new Intl.NumberFormat().format(x)
}

function formatValue(value) {
  if (value) {
    if (value < 10 && !Number.isInteger(value)) {
      // Pas plus de deux nombres après la virgule pour gagner en lisibilité
      value = parseFloat(value.toFixed(2))
    } else {
      value = Math.round(value)
    }
  }
  return value
}

export function formatData(data, file) {
  /**
   * On veut simplifier les données pour garder seulement une liste d'objet avec `year`, `value` et les axes.
   */
  if (!data || data.length === 0) {
    return []
  }
  const axesNames = file.axes
  const valueColumn = file.valueColumn
  const formatedData = data.map((d) => {
    const value = d[valueColumn]
    if (value == null) {
      throw new Error(`No value found for column ${valueColumn} in ${file.id}`)
    }
    const row = {
      year: new Date(d[YEAR_COLUMN]).getFullYear(),
      value: formatValue(value)
    }
    axesNames.forEach((axe) => {
      row[axe] = d[axe]
    })
    return row
  })
  return formatedData
}
