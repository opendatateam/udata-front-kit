Cypress.Commands.add('baseMocksForSimplifions', (topics: object[] = []) => {
  cy.mockDatagouvObjectList('discussions')
  cy.mockGristImages()
  cy.mockMatomo()
  cy.mockListApis('topics', topics)
})
