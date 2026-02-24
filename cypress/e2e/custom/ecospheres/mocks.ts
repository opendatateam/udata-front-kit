export const mockUniverseOrganizations = () => {
  const baseUrl =
    'https://raw.githubusercontent.com/ecolabdata/ecospheres-universe/refs/heads/main/dist'
  const orgsBody = [
    {
      id: '534fff4ca3a7292c64a77c95',
      name: 'ADEME',
      slug: 'ademe',
      type: ''
    }
  ]

  cy.intercept(
    'GET',
    new RegExp(
      `${baseUrl}/ecospheres-(demo|prod)/organizations-(dataservices|datasets|bouquets)\\.json$`
    ),
    {
      statusCode: 200,
      body: orgsBody
    }
  ).as('get_universe_organizations')
}
