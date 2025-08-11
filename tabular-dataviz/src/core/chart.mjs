/**
 * Ce fichier initialise et configure le graphique en utilisant Chart.js
 */

import Chart from 'chart.js/auto'

import { makeDatasets } from './datasets.mjs'
import {
  getChartCanvas,
  getChartTitle,
  getOneYearValueContainer
} from './dom.mjs'
import { COLORS } from './enums.mjs'
import { formatBigNumber, formatNumber } from './format.mjs'

// Plugin "plein écran" basique
const fullscreenPlugin = {
  id: 'fullscreen',
  afterRender(chart) {
    if (!chart.options.plugins.fullscreen?.enabled) return

    const canvas = chart.canvas
    const container = canvas.parentElement

    // Add fullscreen button if it doesn't exist
    let btn = container.querySelector('.chart-fullscreen-btn')
    if (!btn) {
      btn = document.createElement('button')
      btn.className = 'chart-fullscreen-btn'
      btn.innerHTML = '⛶'
      btn.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(0,0,0,0.1);
        border: none;
        padding: 5px 8px;
        cursor: pointer;
        font-size: 14px;
        z-index: 1000;
      `
      btn.onclick = () => {
        if (!document.fullscreenElement) {
          container.requestFullscreen()
        } else {
          document.exitFullscreen()
        }
      }
      container.style.position = 'relative'
      container.appendChild(btn)
    }
  }
}

Chart.register(fullscreenPlugin)

function getConfig(indicator, datasets, minYear, maxYear) {
  // Calcule la valeur maximale de tous les datasets pour une unité cohérente
  const maxValue = Math.max(
    ...datasets.flatMap((dataset) => dataset.data.map((point) => point.y))
  )
  const chartTitle = getChartTitle(indicator)

  return {
    type: datasets.every((dt) => dt.data.length <= 1) ? 'bar' : 'line',
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        // Pour éviter que le graphe ne soit caché par le bouton plein écran
        padding: {
          top: 15
        }
      },
      interaction: {
        intersect: false,
        mode: 'x'
      },
      plugins: {
        fullscreen: {
          enabled: true
        },
        title: {
          display: !!chartTitle,
          text: chartTitle,
          font: {
            family: 'Marianne, arial, sans-serif'
          }
        },
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
              return prefix + formatNumber(item.raw.y) + indicator.unite
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
            stepSize: 1,
            callback: (val) => (Number.isInteger(val) ? val.toString() : '')
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
   ** Pour définir la borne min et max de l'axe X du graphique, avec min 3 années
   */
  const minYear = Math.min(...years)
  const maxYear = Math.max(...years)
  const yearRange = maxYear - minYear

  if (yearRange === 0) {
    // Une seule année : centrer sur 3 années
    return [minYear - 1, minYear + 1]
  } else if (yearRange === 1) {
    // Deux années : ajouter une année avant pour avoir 3 années
    return [minYear - 1, maxYear]
  }
  // 3 années ou plus : utiliser les valeurs originales
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
    <span>${formatNumber(data.y) + indicator.unite}</span>
  </div>
  <p class="help">Seule année de données disponible.</p>
  `
}

export function makeChart(indicator) {
  const datasets = makeDatasets(indicator)
  applyColors(datasets)
  const canvas = getChartCanvas(indicator)
  const canvasContainer = canvas.parentElement
  const oneYearContainer = getOneYearValueContainer(indicator)
  const oldChart = Chart.getChart(canvas)
  if (oldChart) {
    oldChart.destroy()
  }
  const years = datasets.map((dataset) => dataset.data.map((d) => d.x)).flat()
  const [minYear, maxYear] = getMinMaxYear(years)
  // Si le graphique contient qu'une seule valeur pour une seule année
  if (datasets.length === 1 && datasets[0].data.length === 1) {
    canvasContainer.classList.add('hidden')
    makeOneYearValue(indicator, datasets)
    oneYearContainer.classList.remove('hidden')
  } else {
    oneYearContainer.classList.add('hidden')
    getOneYearValueContainer(indicator).classList.add('hidden')
    new Chart(canvas, getConfig(indicator, datasets, minYear, maxYear))
    canvasContainer.classList.remove('hidden')
  }
}
