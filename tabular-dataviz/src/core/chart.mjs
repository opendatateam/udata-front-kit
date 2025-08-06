/**
 * Ce fichier initialise et configure le graphique en utilisant Chart.js
 */

import Chart from 'chart.js/auto'
import { makeDatasets } from './datasets.mjs'
import { getChartCanvas, getOneYearValueContainer } from './dom.mjs'
import { COLORS } from './enums.mjs'
import { formatBigNumber, numberWithCommas } from './format.mjs'

function getConfig(indicator, datasets, minYear, maxYear) {
  // Calcule la valeur maximale de tous les datasets pour une unité cohérente
  const maxValue = Math.max(
    ...datasets.flatMap((dataset) => dataset.data.map((point) => point.y))
  )

  return {
    type: datasets.every((dt) => dt.data.length <= 1) ? 'bar' : 'line',
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'x'
      },
      plugins: {
        legend: {
          display: datasets.length > 1,
          labels: {
            boxWidth: 16,
            boxHeight: 16
          },
          onClick: () => {}
        },
        tooltip: {
          bodySpacing: 4,
          displayColors: datasets.length > 1,
          callbacks: {
            title: (items) => items[0].raw.x.toString(),
            label: (item) => {
              const prefix =
                datasets.length > 1 ? item.dataset.label + ' : ' : ''
              return prefix + numberWithCommas(item.raw.y) + indicator.unite
            }
          },
          itemSort: (i, j) => {
            return j.raw.y - i.raw.y
          }
        }
      },
      scales: {
        x: {
          type: 'linear',
          suggestedMax: maxYear,
          suggestedMin: minYear,
          ticks: {
            callback: (val) => val.toString()
          }
        },
        y: {
          title: {
            display: true,
            text: indicator.unite
          },
          ticks: {
            callback: (val) => formatBigNumber(val, maxValue)
          }
        }
      }
    }
  }
}

function getMinMaxYear(years) {
  /**
   ** Pour définir la borne min et max de l'axe X du graphique
   */
  const minYear = Math.min(...years)
  const minNumberOfYears = 3
  let maxYear = Math.max(...years)
  if (maxYear - minYear < minNumberOfYears) {
    maxYear += 1
  }
  return [minYear, maxYear]
}

function applyColors(datasets) {
  datasets.forEach((dataset, idx) => {
    dataset.borderColor = COLORS[idx % COLORS.length]
    dataset.backgroundColor = COLORS[idx % COLORS.length]
  })
}

function makeOneYearValue(indicator, datasets) {
  /**
   * Si le graphique ne contient qu'une seule valeur pour une seule année
   * On affiche un gros chiffre à la place du graphique
   */
  const container = getOneYearValueContainer(indicator)
  const data = datasets[0].data[0]
  container.innerHTML = `
  <div>
    <span>${data.x} : </span>
    <span>${numberWithCommas(data.y) + indicator.unite}</span>
  </div>
  <p class="help">Seule année de données disponible.</p>
  `
  container.classList.remove('hidden')
  const canvasContainer = getChartCanvas(indicator).parentElement
  canvasContainer.classList.add('hidden')
}

export function makeChart(indicator) {
  const datasets = makeDatasets(indicator)
  applyColors(datasets)
  const canvas = getChartCanvas(indicator)
  const oldChart = Chart.getChart(canvas)
  if (oldChart) {
    oldChart.destroy()
  }
  const years = datasets.map((dataset) => dataset.data.map((d) => d.x)).flat()
  const [minYear, maxYear] = getMinMaxYear(years)
  // Si le graphique contient qu'une seule valeur pour une seule année
  if (datasets.length === 1 && datasets[0].data.length === 1) {
    makeOneYearValue(indicator, datasets)
  } else {
    // on paramètre si le graphique est visible ou non grâce à une classe CSS "hidden"
    canvas.parentElement.classList.remove('hidden')
    getOneYearValueContainer(indicator).classList.add('hidden')
    new Chart(canvas, getConfig(indicator, datasets, minYear, maxYear))
  }
}
