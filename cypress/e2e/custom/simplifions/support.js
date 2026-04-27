Cypress.Commands.add('baseMocksForSimplifions', (topics = []) => {
  cy.mockDatagouvObjectList('discussions')
  cy.mockGristImages()
  cy.mockMatomo()
  cy.mockListApis('topics', topics)
})
