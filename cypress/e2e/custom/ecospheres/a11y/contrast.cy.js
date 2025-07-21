describe('Contrast Testing', () => {
  const pages = {
    '/': '#main-content',
    '/datasets': 'ul.fr-grid-row > li',
    '/bouquets': 'ul.fr-grid-row > li',
    '/indicators': 'ul.fr-grid-row > li'
  }

  Object.keys(pages).forEach((path) => {
    it(`checks color contrast on ${path} page`, () => {
      cy.visit(path)
      cy.get(pages[path]).should('be.visible')
      cy.injectAxe()
      cy.checkA11y(null, {
        runOnly: {
          type: 'rule',
          values: ['color-contrast']
        }
      })
    })
  })
})
