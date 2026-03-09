describe('Global Layout', () => {
  describe('Top Menu', () => {
    it('should display the menu entries', () => {
      cy.visit(`/`)
      const container = cy.get('[aria-label="Menu principal"]')
      container.find('ul li').each(($li, index) => {
        cy.wrap($li).should('be.visible')
        cy.wrap($li).should('not.be.empty')
        // TODO: this should be fetched from config,
        // but passing the config to the Cypress build is difficult
        const expectedMenuTexts = [
          'Accueil',
          'Données',
          'Indicateurs',
          'API',
          'Bouquets',
          'Organisations',
          'À propos'
        ]
        cy.wrap($li)
          .invoke('text')
          .then((text) => {
            expect(text.trim()).to.equal(expectedMenuTexts[index])
          })
      })
    })
  })
})
