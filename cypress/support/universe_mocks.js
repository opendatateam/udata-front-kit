Cypress.Commands.add('mockUniverseOrganizations', () => {
  const baseUrl =
    'https://raw.githubusercontent.com/opendatateam/udata-front-kit-universe/refs/heads/artifacts/dist'
  const orgsBody = [
    {
      id: '534fff4ca3a7292c64a77c95',
      name: 'ADEME',
      slug: 'ademe',
      type: ''
    }
  ]
  const siteId = Cypress.env('siteId')

  cy.intercept(
    'GET',
    new RegExp(
      `${baseUrl}/${siteId}-(demo|prod|preprod)/organizations-(dataservices|datasets|bouquets)\\.json$`
    ),
    {
      statusCode: 200,
      body: orgsBody
    }
  ).as('get_universe_organizations')
})
