Cypress.Commands.add('mockGristImages', () => {
  cy.readFile('public/static/blank_state/file.svg').then((svgContent) => {
    cy.intercept(
      'GET',
      'https://grist.numerique.gouv.fr/api/docs/*/attachments/*/download',
      {
        statusCode: 200,
        headers: {
          'Content-Type': 'image/svg+xml'
        },
        body: svgContent
      }
    ).as('mockGristImages')
  })
})

Cypress.Commands.add('mockGristRecords', (resourceId, elements = []) => {
  cy.intercept(
    'GET',
    `https://grist.numerique.gouv.fr/api/docs/*/tables/${resourceId}/records*`,
    {
      statusCode: 200,
      body: {
        records: elements
      }
    }
  ).as(`get_grist_${resourceId}_records`)
})

Cypress.Commands.add('mockGristRecord', (resourceId, element) => {
  cy.intercept(
    'GET',
    `https://grist.numerique.gouv.fr/api/docs/*/tables/${resourceId}/records?filter=${JSON.stringify({ id: [element.id] })}`,
    {
      statusCode: 200,
      body: {
        records: [element]
      }
    }
  ).as(`get_grist_${resourceId}_record_${element.id}`)
})

Cypress.Commands.add('mockGristRecordsByIds', (resourceId, elements) => {
  const ids = elements.map((el) => el.id)
  cy.intercept(
    'GET',
    `https://grist.numerique.gouv.fr/api/docs/*/tables/${resourceId}/records?filter=${JSON.stringify({ id: ids })}`,
    {
      statusCode: 200,
      body: {
        records: elements
      }
    }
  ).as(`get_grist_${resourceId}_records_${ids.join('_')}`)
})
