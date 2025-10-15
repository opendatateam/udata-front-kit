const datagouvResponseBuilder = (data) => {
  return {
    data: data.slice(0, 10),
    next_page: null,
    page: Math.max(1, Math.ceil(data.length / 10)),
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

Cypress.Commands.add('mockDatagouvObjectList', (resourceName, data = []) => {
  cy.intercept('GET', datagouvUrlRegex(resourceName), {
    statusCode: 200,
    body: datagouvResponseBuilder(data)
  }).as(`get_${resourceName}_list`)
})

Cypress.Commands.add(
  'mockDatagouvObjectListWithTags',
  (resourceName, tags = [], data = []) => {
    const tagsParam = tags
      .map((tag) => `tag=${encodeURIComponent(tag)}`)
      .join('&')
    const urlPattern = new RegExp(
      `.*data\\.gouv\\.fr/api/\\d/${resourceName}.*${tagsParam}.*`
    )

    cy.intercept('GET', urlPattern, {
      statusCode: 200,
      body: datagouvResponseBuilder(data)
    }).as(`get_${resourceName}_list_with_tags_${tags.join('_')}`)
  }
)

Cypress.Commands.add(
  'mockDatagouvObject',
  (resourceName, resourceId, data = {}) => {
    cy.intercept('GET', datagouvUrlRegex(resourceName, resourceId), {
      statusCode: 200,
      body: data
    }).as(`get_${resourceName}_${resourceId}`)
  }
)

// We can't use req.query to check the request params because the tags are not handled as arrays
// in the request so req.query only contains the last tag. So we check the params in the url instead.
// This is a known issue of cypress: https://github.com/cypress-io/cypress/issues/17921
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

Cypress.Commands.add('mockMatomo', () => {
  cy.intercept('GET', 'https://stats.data.gouv.fr/matomo.js', {
    statusCode: 200,
    body: '// Mocked Matomo script'
  }).as('mockMatomo')
})

Cypress.Commands.add('mockStaticDatagouv', () => {
  cy.intercept('GET', 'https://**static.data.gouv.fr/**', {
    statusCode: 200,
    body: '// Mocked static.data.gouv.fr content'
  }).as('mockStaticDatagouv')

  // Mock avatar API calls
  cy.intercept('GET', datagouvUrlRegex('avatars'), {
    statusCode: 200,
    body: '// Mocked avatar image',
    headers: {
      'Content-Type': 'image/png'
    }
  }).as('mockAvatars')
})

Cypress.Commands.add('mockTopicElements', (resourceId, elements = []) => {
  cy.intercept('GET', datagouvUrlRegex('topics', `${resourceId}/elements`), {
    statusCode: 200,
    body: datagouvResponseBuilder(elements)
  }).as(`get_topics_${resourceId}_elements`)
})

Cypress.Commands.add('mockSpatialLevels', () => {
  cy.intercept('GET', datagouvUrlRegex('spatial/levels'), {
    statusCode: 200,
    body: [
      { id: 'country', name: 'Pays' },
      { id: 'fr:region', name: 'Région française' },
      { id: 'fr:departement', name: 'Département français' },
      { id: 'fr:commune', name: 'Commune française' }
    ]
  }).as('get_spatial_levels')
})

Cypress.Commands.add('mockDatasetLicenses', () => {
  cy.intercept('GET', datagouvUrlRegex('datasets/licenses'), {
    statusCode: 200,
    body: []
  }).as('get_licenses')
})

Cypress.Commands.add('mockResourceTypes', () => {
  cy.intercept('GET', datagouvUrlRegex('datasets/resource_types'), {
    statusCode: 200,
    body: []
  }).as('get_resource_types')
})

Cypress.Commands.add('mockDatasetFrequencies', () => {
  cy.intercept('GET', datagouvUrlRegex('datasets/frequencies'), {
    statusCode: 200,
    body: []
  }).as('get_frequencies')
})

Cypress.Commands.add('mockSpatialGranularities', () => {
  cy.intercept('GET', datagouvUrlRegex('spatial/granularities'), {
    statusCode: 200,
    body: []
  }).as('get_spatial_granularities')
})
