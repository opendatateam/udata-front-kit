// ***********************************************
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

import './authentication.js'
import './filters.js'

Cypress.Commands.add('checkRGAAContrast', (context = null, options = {}) => {
  cy.checkA11y(context, {
    runOnly: {
      type: 'rule',
      values: ['color-contrast']
    },
    rules: {
      'color-contrast': {
        enabled: true,
        options: {
          largeTextPt: 24, // RGAA: text must be 24px+ to be "large"
          boldTextPt: 18.5, // RGAA: bold text must be 18.5px+ to be "large"
          ...options
        }
      }
    }
  })
})
