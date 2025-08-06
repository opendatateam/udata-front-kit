/*
 ** Fichier pour afficher les filtres des axes sous forme de checkboxes
 */

import { makeChart } from '../core/chart.mjs'
import {
  getAxeCheckboxes,
  getAxesDropdownContainer,
  getGroupAxeSwitch
} from '../core/dom.mjs'

function getAxesForCurrentFileAndData(file, data) {
  /*
   * On récupère directement les valeurs des axes depuis les données et pas les meta-données
   */
  const axesNames = Object.keys(file.axes)
  return axesNames.reduce((acc, key) => {
    acc[key] = [...new Set(data.map((item) => item[key]))]
    return acc
  }, {})
}

export function makeAxesCheckboxes(indicator, file, data) {
  /*
   * On boucle sur les axes, puis on boucle de nouveau sur les valeurs des axes
   * Pour afficher une checkbox par valeur d'axe
   * si l'indicateur est sommable on ajoute un interrupteur "regrouper" pour l'axe
   */
  const axes = getAxesForCurrentFileAndData(file, data)
  let html = ''

  Object.entries(axes).forEach(([axe, values]) => {
    const suffix = `${axe}-${indicator.id}`
    html += `
    <fieldset id="axe-checkboxes-${suffix}" class="fr-fieldset" aria-labelledby="checkboxes-legend-${suffix} checkboxes-messages-${suffix}">
      <legend class="fr-fieldset__legend--regular fr-fieldset__legend" id="checkboxes-legend-${suffix}">
          ${axe.charAt(0).toUpperCase() + axe.slice(1)}
      </legend>
      ${values
        .map(
          (value) => `
         <div class="fr-fieldset__element">
          <div class="fr-checkbox-group fr-checkbox-group--sm">
              <input name="checkboxes-${axe}-${value}" id="checkboxes-${axe}-${value}-${indicator.id}" type="checkbox" checked data-value="${value}">
              <label class="fr-label" for="checkboxes-${axe}-${value}-${indicator.id}">
                  ${value}
              </label>
          </div>
      </div>
        `
        )
        .join('\n')}
      <div class="fr-messages-group" id="checkboxes-messages-${suffix}" aria-live="polite"></div>
  </fieldset>
        ${
          indicator.summable &&
          `
    <div class="fr-toggle">
        <input type="checkbox" checked class="fr-toggle__input" id="group-axe-${suffix}">
        <label class="fr-toggle__label" for="group-axe-${suffix}">Regrouper</label>
    </div>
      `
        }
    `
  })

  const container = getAxesDropdownContainer(indicator)
  container.innerHTML = html

  // on ajoute des listeners aux checkboxes et à l'interrupteur
  Object.keys(axes).forEach((axe) => {
    const checkboxes = getAxeCheckboxes(indicator, axe)
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', () => {
        makeChart(indicator)
      })
    })
    const groupSwitch = getGroupAxeSwitch(indicator, axe)
    if (groupSwitch) {
      groupSwitch.addEventListener('change', () => makeChart(indicator))
    }
  })
}
