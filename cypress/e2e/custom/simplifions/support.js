Cypress.Commands.add('baseMocksForSimplifions', () => {
  cy.mockDatagouvObjectList('discussions')
  cy.mockGristImages()
  cy.mockSentry()
})
