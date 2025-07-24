describe('Simplifions Solutions Page', () => {
  const topicsName = 'solutions'

  beforeEach(() => {
    // Visit the Simplifions home page before each test
    cy.visit('/solutions')
  })

  it('should display the solutions listing page correctly', () => {
    // Check that the page body is visible
    cy.get('body').should('be.visible')

    // Verify the page loads and has the correct title
    cy.get('h1').should('contain.text', 'Solutions')

    // Verify that the list is not empty
    cy.get('ul[role="list"]').should('not.be.empty')
  })

  it('should display a paginated list of solutions', () => {
    // Verify that the page has 10 results
    cy.get('div.test_topic-car').should('have.length', 10)

    // Verify that the page has a pagination component
    cy.get('nav.fr-pagination').should('be.visible')

    // Check that the pagination component has several pages
    cy.get('nav.fr-pagination').within(() => {
      cy.get('a.fr-pagination__link.fr-unhidden-lg').should('have.length.gt', 1)
    })
  })

  it('should be able to search for a solution', () => {
    // Fill the search bar with the topic name
    cy.get('input#search-topic').type('Osiris')

    // Verify that the page has the correct number of results
    cy.get('#number-of-results').should('contain.text', '1 solution disponible')
  })

  it('should be able to filter by fournisseurs de service ', () => {
    cy.filterShouldRemoveResults(topicsName, 'À destination de :', 'Communes')
  })

  it('should be able to filter by target users ', () => {
    cy.filterShouldRemoveResults(
      topicsName,
      'Pour simplifier les démarches de :',
      'Particuliers'
    )
  })

  it('should be able to filter by budget ', () => {
    cy.filterShouldRemoveResults(
      topicsName,
      'Moyens disponibles pour la mise en œuvre :',
      'Avec des moyens techniques'
    )
  })

  it('should be able to filter by types de simplification ', () => {
    cy.filterShouldRemoveResults(
      topicsName,
      'Type de simplification des démarches :',
      'Dites-le nous une fois'
    )
  })
})
