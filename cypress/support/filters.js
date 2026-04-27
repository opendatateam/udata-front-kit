/**
 * Custom command to select an option in a SearchableSelect component (Headless UI Combobox).
 * @param {string} selectLabel - The label text of the select component (e.g., "Organisation")
 * @param {string} optionLabel - The label/text of the option to select (e.g., "ADEME")
 */
Cypress.Commands.add('selectFilterValue', (selectLabel, optionLabel) => {
  cy.contains('label.fr-label', selectLabel)
    .closest('.fr-input-group')
    .within(() => {
      // Click the combobox open button (covers the full input area when closed)
      cy.get('[data-testid^="searchable-select-"]').click()
      // Click the matching option in the dropdown
      cy.contains('li', optionLabel).click()
    })
})

Cypress.Commands.add('clickCheckbox', (checkbox_name) => {
  cy.get(`input[name="${checkbox_name}"]`)
    .invoke('attr', 'id')
    .then((inputId) => {
      cy.get(`label[for="${inputId}"]`).click()
    })
})

Cypress.Commands.add(
  'expectActionToCallApi',
  (action, resourceName, expectedUrlParams) => {
    const matches = (url) =>
      expectedUrlParams instanceof RegExp
        ? expectedUrlParams.test(url)
        : url.includes(expectedUrlParams)

    cy.wait(`@get_${resourceName}_list`)
    action()
    // Check the intercepted call after the fact so background-type calls on pages
    // with multiple search types (e.g. simplifions) don't cause false failures.
    cy.wait(`@get_${resourceName}_list`).then((interception) => {
      if (!matches(interception.request.url)) {
        // Multiple types fired; the first call was a background type — check the next
        cy.wait(`@get_${resourceName}_list`)
          .its('request.url')
          .should(
            expectedUrlParams instanceof RegExp ? 'match' : 'include',
            expectedUrlParams
          )
      }
    })
  }
)
