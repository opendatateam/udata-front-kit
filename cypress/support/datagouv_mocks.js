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
  }).as('get_static_datagouv')

  // Mock avatar API calls
  cy.intercept('GET', datagouvUrlRegex('avatars'), {
    statusCode: 200,
    body: '// Mocked avatar image',
    headers: {
      'Content-Type': 'image/png'
    }
  }).as('get_avatars')

  // Mock datagouvfr-pages content
  cy.intercept(
    'GET',
    'https://raw.githubusercontent.com/datagouv/datagouvfr-pages/**',
    {
      statusCode: 200,
      body: '// Mocked static.data.gouv.fr content'
    }
  ).as('get_datagouvfr_pages')
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

Cypress.Commands.add('mockDatasetBadges', () => {
  cy.intercept('GET', datagouvUrlRegex('datasets/badges'), {
    statusCode: 200,
    body: []
  }).as('get_badges')
})

Cypress.Commands.add('mockResourceTypes', () => {
  cy.intercept('GET', datagouvUrlRegex('datasets/resource_types'), {
    statusCode: 200,
    body: [
      {
        id: 'main',
        label: 'Fichier principal'
      }
    ]
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
    body: [
      { id: 'country', name: 'Pays' },
      { id: 'fr:region', name: 'Région française' },
      { id: 'fr:departement', name: 'Département français' },
      { id: 'fr:commune', name: 'Commune française' }
    ]
  }).as('get_spatial_granularities')
})

Cypress.Commands.add('mockSpatialZonesSuggest', () => {
  cy.intercept('GET', datagouvUrlRegex('spatial/zones/suggest'), {
    statusCode: 200,
    body: [
      {
        id: 'fr:commune:75056',
        name: 'Paris',
        code: '75056',
        level: 'fr:commune',
        population: 2161000,
        area: 105.4
      },
      {
        id: 'fr:departement:75',
        name: 'Paris',
        code: '75',
        level: 'fr:departement',
        population: 2161000,
        area: 105.4
      }
    ]
  }).as('get_spatial_zones_suggest')
})

Cypress.Commands.add('mockSpatialZone', () => {
  cy.intercept('GET', datagouvUrlRegex('spatial/zone/fr:commune:75056'), {
    statusCode: 200,
    body: {
      id: 'fr:commune:75056',
      name: 'Paris',
      code: '75056',
      level: 'fr:commune',
      population: 2161000,
      area: 105.4
    }
  }).as('get_spatial_zone')
})

Cypress.Commands.add('mockDatasetSchemas', () => {
  cy.intercept('GET', datagouvUrlRegex('datasets/schemas'), {
    statusCode: 200,
    body: []
  }).as('get_schemas')
})

Cypress.Commands.add('mockResources', (datasetId, data = []) => {
  cy.intercept('GET', datagouvUrlRegex(`datasets/${datasetId}/resources`), {
    statusCode: 200,
    body: {
      data,
      total: data.length
    }
  }).as(`get_resources_${datasetId}`)
})

Cypress.Commands.add('mockMetricsApi', (datasetId) => {
  cy.intercept(
    'GET',
    `https://metric-api.data.gouv.fr/api/datasets/data/?dataset_id__exact=${datasetId}&metric_month__sort=desc&page_size=12`,
    {
      statusCode: 200,
      body: { data: [] }
    }
  ).as(`get_metrics_${datasetId}`)
  cy.intercept(
    'GET',
    `https://metric-api.data.gouv.fr/api/datasets_total/data/?dataset_id__exact=${datasetId}`,
    {
      statusCode: 200,
      body: { data: [] }
    }
  ).as(`get_metrics_total_${datasetId}`)
})

Cypress.Commands.add(
  'mockDatasetAndRelatedObjects',
  (dataset, resources = []) => {
    // Update dataset.resources.total to match the resources array
    dataset.resources.total = resources.length
    cy.mockDatagouvObject('datasets', dataset.id, dataset)
    // Mock related APIs
    cy.mockDatasetBadges()
    cy.mockSpatialLevels()
    cy.mockDatasetLicenses()
    cy.mockResourceTypes()
    cy.mockDatasetFrequencies()
    cy.mockSpatialGranularities()
    cy.mockDatasetSchemas()
    cy.mockDatagouvObjectList('discussions', [])
    cy.mockDatagouvObjectList('reuses', [])
    cy.mockResources(dataset.id, resources)
    cy.mockMetricsApi(dataset.id)
  }
)
