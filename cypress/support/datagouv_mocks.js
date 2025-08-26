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

Cypress.Commands.add('mockDatagouvResource', (resource_name, data) => {
  cy.intercept('GET', `**/api/2/${resource_name}/**`, {
    statusCode: 200,
    body: datagouvResponseBuilder(data)
  }).as(`get${capitalizeFirstLetter(resource_name)}`)
})

// We can't use req.query to check the request params because the tags are not properly handled as an array
// in the request so req.query only contains the last tag. I ended up checking for the params in the url instead.
Cypress.Commands.add(
  'expectRequestWithParams',
  (resource_name, request_params_string) => {
    cy.intercept('GET', `**/api/2/${resource_name}/**`, (req) => {
      if (request_params_string instanceof RegExp) {
        expect(req.url).to.match(request_params_string)
      } else {
        expect(req.url).to.include(request_params_string)
      }
    }).as(`get${capitalizeFirstLetter(resource_name)}`)
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
