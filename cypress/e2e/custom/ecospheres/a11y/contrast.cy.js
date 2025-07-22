describe('a11y contrast testing', () => {
  const pages = {
    '/': '#main-content',
    '/datasets': 'ul.fr-grid-row > li',
    '/bouquets': 'ul.fr-grid-row > li',
    '/indicators': 'ul.fr-grid-row > li'
  }

  const testContrast = (path, selector) => {
    cy.visit(path)
    cy.get(selector).should('be.visible')
    // check that loader has gone away
    cy.get('.vl-overlay').should('not.exist')
    cy.injectAxe()
    cy.checkRGAAContrast()
  }

  const userStates = [
    { name: 'connected', setup: () => cy.simulateConnectedUser() },
    { name: 'disconnected', setup: () => cy.simulateDisconnectedUser() }
  ]

  userStates.forEach(({ name, setup }) => {
    describe(`${name} user`, () => {
      beforeEach(setup)
      Object.keys(pages).forEach((path) => {
        it(`checks color contrast on ${path} page`, () => {
          testContrast(path, pages[path])
        })
      })
    })
  })
})
