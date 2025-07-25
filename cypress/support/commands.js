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
