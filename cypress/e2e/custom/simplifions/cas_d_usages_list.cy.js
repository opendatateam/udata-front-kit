describe("Simplifions Cas d'usages Listing Page", () => {
  const topicsName = "cas d'usages"

  beforeEach(() => {
    // Visit the Simplifions home page before each test
    cy.visit('/cas-d-usages')
  })

  it("should display the cas d'usages listing page correctly", () => {
    // Check that the page body is visible
    cy.get('body').should('be.visible')

    // Verify the page loads and has the correct title
    cy.get('h1').should('contain.text', "Cas d'usages")

    // Verify that the list is not empty
    cy.get('ul[role="list"]').should('not.be.empty')
  })

  it("should display a paginated list of cas d'usages", () => {
    // Verify that the page has 10 results
    cy.get('div.topic-card').should('have.length', 10)

    // Verify that the page has a pagination component
    cy.get('nav.fr-pagination').should('be.visible')

    // Check that the pagination component has several pages
    cy.get('nav.fr-pagination').within(() => {
      cy.get('a.fr-pagination__link.fr-unhidden-lg').should('have.length.gt', 1)
    })
  })

  it("should be able to search for a cas d'usage", () => {
    // Fill the search bar with the topic name
    cy.get('input#search-topic').type('Aides sociales des CCAS')

    // Verify that the page has the correct number of results
    cy.get('#number-of-results').should(
      'contain.text',
      "1 cas d'usage disponible"
    )
  })

  it('should be able to filter by fournisseurs de service ', () => {
    cy.selectFilterShouldRemoveResults(
      topicsName,
      'À destination de :',
      'Communes'
    )
  })

  it('should be able to filter by target users ', () => {
    cy.selectFilterShouldRemoveResults(
      topicsName,
      'Pour simplifier les démarches de :',
      'Particuliers'
    )
  })

  it('should be able to filter by budget ', () => {
    cy.selectFilterShouldRemoveResults(
      topicsName,
      'Moyens disponibles pour la mise en œuvre :',
      'Aucun développement, ni budget'
    )
  })

  it('should be able to filter by types de simplification ', () => {
    cy.selectFilterShouldRemoveResults(
      topicsName,
      'Type de simplification des démarches :',
      'Accès facile'
    )
  })

  it('should not have the private filter', () => {
    cy.get('input[name="include_private"]').should('not.exist')
  })

  describe('when connected with a random user', () => {
    it("should not be able to see any private cas d'usages", () => {
      // Connect the user
      cy.simulateConnectedUser()

      cy.filterShouldNotChangeResults(topicsName, () => {
        cy.get('input[name="include_private"]')
          .invoke('attr', 'id')
          .then((inputId) => {
            cy.get(`label[for="${inputId}"]`).click()
          })
      })
    })
  })

  // describe('when connected with a DINUM user', () => {
  //   it('should be able to filter the private cas d\'usages', () => {
  //     // Connect the user
  //     cy.simulateConnectedUser({
  //       organization: {
  //         "class": "Organization",
  //         "id": "57fe2a35c751df21e179df72",
  //       }
  //     })

  //     cy.filterShouldChangeResults(topicsName, 'increase', () => {
  //       cy.get('input[name="include_private"]').invoke('attr', 'id').then((inputId) => {
  //         cy.get(`label[for="${inputId}"]`).click()
  //       })
  //     })
  //   })
  // })
})
