/**
 * Mocks all API calls triggered by GlobalSearch on list pages.
 * Reads the site config to find every page with list_all=true, collects the unique
 * object_type values (datasets / dataservices / topics), and mocks each endpoint.
 * The primary type being tested gets real data; all others return an empty response.
 *
 * @param {'datasets'|'dataservices'|'topics'} primaryType - The type under test.
 * @param {Array} [primaryData=[]] - Mock response data for the primary type.
 */
Cypress.Commands.add('mockListApis', (primaryType, primaryData = []) => {
  cy.mockUniverseOrganizations()

  const pages = Cypress.env('siteConfig')?.pages ?? {}
  const listTypes = new Set(
    Object.values(pages)
      .filter((page) => page.list_all)
      .map((page) => page.object_type)
  )

  listTypes.forEach((type) => {
    cy.mockDatagouvObjectList(type, type === primaryType ? primaryData : [])
  })
})

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
