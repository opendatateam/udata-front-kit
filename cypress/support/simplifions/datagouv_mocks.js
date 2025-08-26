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

Cypress.Commands.add(
  'expectRequestParams',
  (resource_name, request_params_string) => {
    cy.intercept('GET', `**/api/2/${resource_name}/**`, (req) => {
      // We can't use req.query because the tags are not properly handled as an array in the request
      // so req.query only contains the last tag. I ended up checking for the params in the url instead.
      expect(req.url).to.include(request_params_string)
    }).as(`get${capitalizeFirstLetter(resource_name)}`)
  }
)
