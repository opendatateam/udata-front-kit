/**
 * Custom command to select an option in a multiselect component
 * @param {string} selectLabel - The label text of the select component (e.g., "À destination de :")
 * @param {string} optionLabel - The label/text of the option to select (e.g., "Communes")
 */
Cypress.Commands.add('selectFilterValue', (selectLabel, optionLabel) => {
  // Find the label with the specified text, then navigate to its parent select group
  cy.contains('label.fr-label', selectLabel)
    .parent('.fr-select-group')
    .within(() => {
      // Click on the multiselect wrapper to open the dropdown
      cy.get('.multiselect-wrapper').click()

      // Wait for the dropdown to become visible (not have 'is-hidden' class)
      cy.get('.multiselect-dropdown').should('not.have.class', 'is-hidden')

      // Find and click the option with the matching text content
      cy.get('.multiselect-option').contains(optionLabel).click()

      // Verify the dropdown is closed again
      cy.get('.multiselect-dropdown').should('have.class', 'is-hidden')
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
    cy.wait(`@get_${resourceName}_list`)
    cy.expectRequestWithParams(resourceName, expectedUrlParams)
    action()
    cy.wait(`@get_${resourceName}_list`)
  }
)
