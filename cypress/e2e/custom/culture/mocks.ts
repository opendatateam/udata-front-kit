export const mockUniverseOrganizations = () => {
  const baseUrl =
    'https://raw.githubusercontent.com/culturegouv/donnees-ouvertes/refs/heads/main/data'
  const orgsBody = [
    {
      id: '534fff4ca3a7292c64a77c95',
      name: 'ADEME',
      slug: 'ademe',
      type: ''
    }
  ]

  cy.intercept('GET', new RegExp(`${baseUrl}/organizations-datasets\\.json$`), {
    statusCode: 200,
    body: orgsBody
  }).as('get_universe_organizations')
}
