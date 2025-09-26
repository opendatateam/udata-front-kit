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
})

Cypress.Commands.add('mockTopicElements', (resourceId, elements = []) => {
  cy.intercept('GET', datagouvUrlRegex('topics', `${resourceId}/elements`), {
    statusCode: 200,
    body: datagouvResponseBuilder(elements)
  }).as(`get_topics_${resourceId}_elements`)
})
