// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

/**
 * Custom command to select an option in a DSFR multiselect component
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

Cypress.Commands.add('getNumberOfResults', (topicName) => {
  return cy
    .get('#number-of-results')
    .invoke('text')
    .then((text) => parseInt(text.replace(` ${topicName} disponibles`, '')))
})

Cypress.Commands.add(
  'filterShouldRemoveResults',
  (topicName, selectLabel, optionLabel) => {
    // Store the initial number of results
    cy.getNumberOfResults(topicName).then((initialCount) => {
      // Apply the filter
      cy.selectFilterValue(selectLabel, optionLabel)

      // Wait for the number of results to change
      cy.get('#number-of-results').should(
        'not.contain.text',
        `${initialCount} ${topicName} disponibles`
      )

      cy.getNumberOfResults(topicName).then((newCount) => {
        // Verify that the number of results is less than the initial count
        expect(newCount).to.be.lessThan(initialCount)
        // Verify that the number of results is greater than 0
        expect(newCount).to.be.greaterThan(0)
      })
    })
  }
)
