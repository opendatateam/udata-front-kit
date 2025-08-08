import Choices from 'choices.js'

export function makeSearchDropDown(container, dropdownId, label, options) {
  /**
   * Construction d'une dropdown avec une barre de recherche et un choix unique
   * à l'aide de la librairie choices.js
   * https://github.com/jshjohnson/Choices#readme
   */
  const html = `<div class="fr-select-group">
  <label class="fr-label" for="select-${dropdownId}">${label}</label>
  <select id="select-${dropdownId}" class="fr-select"></select>
  </div>`
  container.innerHTML = html
  const element = document.getElementById(`select-${dropdownId}`)
  new Choices(element, {
    choices: options.map((opt, idx) => ({
      value: opt.value,
      label: opt.label,
      selected: idx === 0,
      disabled: false
    })),
    renderChoiceLimit: 100,
    searchResultLimit: 10,
    position: 'bottom',
    loadingText: 'Chargement...',
    noResultsText: 'Pas de résultats',
    noChoicesText: 'Pas de choix possible',
    itemSelectText: ''
  })
}
