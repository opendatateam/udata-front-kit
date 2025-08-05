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
