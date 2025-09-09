// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import 'cypress-axe'

// Import commands.js using ES2015 syntax:
import './commands'
import './datagouv_mocks'
import './generic_mocks'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Prevent Cypress from failing on uncaught exceptions
Cypress.on('uncaught:exception', (err) => {
  // returning false here prevents Cypress from
  // failing the test on uncaught exceptions
  console.log('Uncaught exception:', err.message)
  return false
})

// Fail tests when external API calls are not mocked
beforeEach(() => {
  cy.catchUnmockedRequests()
})
