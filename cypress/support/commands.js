// ***********************************************
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

Cypress.Commands.add('simulateConnectedUser', (userData = {}) => {
  const defaultUser = {
    id: 'test-user-id',
    first_name: 'Test',
    last_name: 'User',
    slug: 'test-user',
    page: 'https://www.data.gouv.fr/fr/users/test-user/',
    uri: 'https://www.data.gouv.fr/api/1/users/test-user-id/',
    avatar: null,
    avatar_thumbnail: null,
    website: null,
    about: null,
    ...userData
  }

  const mockAccessToken = 'mock-oauth-access-token-for-testing'

  cy.window().then((win) => {
    win.localStorage.setItem('token', mockAccessToken)
  })

  cy.intercept('GET', '**/api/1/me/**', {
    statusCode: 200,
    body: defaultUser
  }).as('getCurrentUser')

  cy.intercept('POST', '**/oauth/revoke', {
    statusCode: 200,
    body: {}
  }).as('revokeToken')
})

Cypress.Commands.add('simulateConnectedDINUMUser', () => {
  cy.simulateConnectedUser({
    id: 'dinum-user-id',
    first_name: 'DINUM',
    last_name: 'User',
    slug: 'dinum-user',
    organizations: [
      {
        class: 'Organization',
        id: '678fbd66febd2b6454916dfe',
        name: 'Direction interministérielle du numérique',
        slug: 'direction-interministerielle-du-numerique'
      }
    ]
  })

  // Intercept simplifions topics API calls
  cy.intercept('GET', '**/api/2/topics/*tag=simplifions*', (req) => {
    if (req.query.include_private === 'true') {
      req.reply({ fixture: 'simplifions/topics_with_private.json' })
    } else {
      req.reply({ fixture: 'simplifions/topics_public.json' })
    }
  }).as('getTopics')
})

Cypress.Commands.add('simulateDisconnectedUser', () => {
  cy.window().then((win) => {
    win.localStorage.removeItem('token')
  })

  cy.intercept('GET', '**/api/1/me/**', {
    statusCode: 401,
    body: { message: 'Token is invalid' }
  }).as('getCurrentUserUnauthorized')
})

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

Cypress.Commands.add('getNumberOfResults', (pageName) => {
  return cy
    .get('#number-of-results')
    .invoke('text')
    .then((text) => parseInt(text.replace(` ${pageName} disponibles`, '')))
})

/**
 * Custom command to check if the number of results changes when a filter is applied
 * @param {string} pageName - The name of the page (e.g., "Cas d'usages")
 * @param {string} expectedChange - The expected change in the number of results (e.g., 'decrease', 'increase')
 * @param {function} filterAction - The action to apply the filter (e.g., cy.selectFilterValue)
 */
Cypress.Commands.add(
  'filterShouldChangeResults',
  (pageName, expectedChange, filterAction) => {
    if (expectedChange !== 'increase' && expectedChange !== 'decrease') {
      throw new Error(
        `expectedChange must be 'increase' or 'decrease', got '${expectedChange}'`
      )
    }

    // Store the initial number of results
    cy.getNumberOfResults(pageName).then((initialCount) => {
      // Apply the filter
      filterAction()

      // Wait for the number of results to change
      cy.get('#number-of-results').should(
        'not.contain.text',
        `${initialCount} ${pageName} disponibles`
      )

      cy.getNumberOfResults(pageName).then((newCount) => {
        // Verify that the number of results is less than the initial count
        if (expectedChange === 'decrease') {
          expect(newCount).to.be.lessThan(initialCount)
        } else {
          expect(newCount).to.be.greaterThan(initialCount)
        }
        // Verify that the number of results is greater than 0
        expect(newCount).to.be.greaterThan(0)
      })
    })
  }
)

Cypress.Commands.add(
  'filterShouldNotChangeResults',
  (pageName, filterAction) => {
    // Store the initial number of results
    cy.getNumberOfResults(pageName).then((initialCount) => {
      // Apply the filter
      filterAction()

      // Check the number of results has not changed
      cy.get('#number-of-results').should(
        'contain.text',
        `${initialCount} ${pageName} disponibles`
      )
    })
  }
)

Cypress.Commands.add(
  'selectFilterShouldRemoveResults',
  (pageName, selectLabel, optionLabel) => {
    cy.filterShouldChangeResults(pageName, 'decrease', () =>
      cy.selectFilterValue(selectLabel, optionLabel)
    )
  }
)
