import { capitalizeFirstLetter } from './utils'

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

const datagouvUrlRegex = (resourceName) => {
  return new RegExp(`.*data\\.gouv\\.fr/api/2/${resourceName}.*`)
}

Cypress.Commands.add('mockDatagouvResourceList', (resourceName, data = []) => {
  cy.intercept('GET', datagouvUrlRegex(resourceName), {
    statusCode: 200,
    body: datagouvResponseBuilder(data)
  }).as(`get${capitalizeFirstLetter(resourceName)}`)
})

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
    }).as(`get${capitalizeFirstLetter(resourceName)}`)
  }
)

Cypress.Commands.add('catchUnmockedRequests', () => {
  cy.intercept('**', (req) => {
    if (req.url.includes('localhost') || req.url.includes('127.0.0.1')) {
      req.continue()
      return
    }
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
