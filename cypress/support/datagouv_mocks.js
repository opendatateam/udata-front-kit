const datagouvResponseBuilder = (data) => {
  return {
    data: data.slice(0, 10),
    next_page: null,
    page: Math.ceil(data.length / 10),
    page_size: 10,
    previous_page: null,
    total: data.length
  }
}

const datagouvUrlRegex = (resourceName, resourceId = null) => {
  return new RegExp(
    `.*data\\.gouv\\.fr/api/\\d/${resourceName}${resourceId ? `/${resourceId}` : ''}.*`
  )
}

Cypress.Commands.add('mockDatagouvResourceList', (resourceName, data = []) => {
  cy.intercept('GET', datagouvUrlRegex(resourceName), {
    statusCode: 200,
    body: datagouvResponseBuilder(data)
  }).as(`get_${resourceName}_list`)
})

Cypress.Commands.add(
  'mockDatagouvResource',
  (resourceName, resourceId, data = {}) => {
    cy.intercept('GET', datagouvUrlRegex(resourceName, resourceId), {
      statusCode: 200,
      body: data
    }).as(`get_${resourceName}_${resourceId}`)
  }
)

// We can't use req.query to check the request params because the tags are not properly handled as an array
// in the request so req.query only contains the last tag. I ended up checking for the params in the url instead.
Cypress.Commands.add(
  'expectRequestWithParams',
  (resourceName, requestParamsString) => {
    cy.intercept('GET', datagouvUrlRegex(resourceName), (req) => {
      if (requestParamsString instanceof RegExp) {
        expect(req.url).to.match(requestParamsString)
      } else {
        expect(req.url).to.include(requestParamsString)
      }
    }).as(`get_${resourceName}_list`)
  }
)

Cypress.Commands.add('catchUnmockedRequests', () => {
  // Intercept only external URLs (not starting with localhost or 127.0.0.1)
  cy.intercept(/^https?:\/\/(?!(localhost|127\.0\.0\.1)(:|\/|$)).*/, (req) => {
    throw new Error(
      `Unmocked external API call detected: ${req.method} ${req.url}`
    )
  }).as('catchUnmockedRequests')
})

Cypress.Commands.add('mockGristImages', () => {
  cy.intercept(
    'GET',
    'https://grist.numerique.gouv.fr/api/docs/*/attachments/*/download',
    {
      statusCode: 200,
      body: 'some image'
    }
  ).as('mockGristImages')
})

Cypress.Commands.add('mockMatomo', () => {
  cy.intercept('GET', 'https://stats.data.gouv.fr/matomo.js', {
    statusCode: 200,
    body: '// Mocked Matomo script'
  }).as('mockMatomo')
})

Cypress.Commands.add('mockStaticDatagouv', () => {
  cy.intercept('GET', 'https://static.data.gouv.fr/**', {
    statusCode: 200,
    body: '// Mocked static.data.gouv.fr content'
  }).as('mockStaticDatagouv')
})
