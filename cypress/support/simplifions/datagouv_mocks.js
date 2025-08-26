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

function capitalizeFirstLetter(val) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1)
}

Cypress.Commands.add('mockResource', (resource_name, data) => {
  cy.intercept('GET', `**/api/2/${resource_name}/**`, {
    statusCode: 200,
    body: datagouvResponseBuilder(data)
  }).as(`get${capitalizeFirstLetter(resource_name)}`)
})

Cypress.Commands.add('expectRequestParams', (resource_name, request_params) => {
  cy.intercept('GET', `**/api/2/${resource_name}/**`, (req) => {
    expect(req.query).to.include(request_params)
  }).as(`get${capitalizeFirstLetter(resource_name)}`)
})
