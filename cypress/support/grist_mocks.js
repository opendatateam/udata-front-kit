Cypress.Commands.add('mockGristImages', () => {
  cy.readFile('public/static/blank_state/file.svg').then((svgContent) => {
    cy.intercept(
      'GET',
      /^https:\/\/grist\.numerique\.gouv\.fr\/api\/docs\/[^/]+\/attachments\/[^/]+\/download/,
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
  const tablePattern = resourceId === '*' ? '[^/]+' : resourceId
  const urlRegex = new RegExp(
    `^https://grist\\.numerique\\.gouv\\.fr/api/docs/[^/]+/tables/${tablePattern}/records`
  )
  cy.intercept('GET', urlRegex, (req) => {
    const url = new URL(req.url)
    const filterParam = url.searchParams.get('filter')
    const filter = filterParam ? JSON.parse(filterParam) : {}

    let records = elements
    if (filter.id) {
      records = elements.filter((el) => filter.id.includes(el.id))
    }

    req.reply({ statusCode: 200, body: { records } })
  }).as(`get_grist_${resourceId}_records`)
})

Cypress.Commands.add('mockGristRecordsByIds', (resourceId, elements) => {
  const ids = elements.map((el) => el.id)
  const urlRegex = new RegExp(
    `^https://grist\\.numerique\\.gouv\\.fr/api/docs/[^/]+/tables/${resourceId}/records\\?filter=%7B%22id%22:%5B${ids.join(',')}%5D%7D$`
  )
  cy.intercept('GET', urlRegex, {
    statusCode: 200,
    body: {
      records: elements
    }
  }).as(`get_grist_${resourceId}_records_${ids.join('_')}`)
})

Cypress.Commands.add('mockGristRecord', (resourceId, element) => {
  cy.mockGristRecordsByIds(resourceId, [element])
})
