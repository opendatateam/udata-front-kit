import { solutionFactory } from '../../../support/factories/topics_factory'

describe('Simplifions Solutions Page', () => {
  beforeEach(() => {
    // Visit the Simplifions home page before each test
    cy.mockResource('topics', solutionFactory.many(11))
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
    cy.get('div.topic-card').should('have.length', 10)
    cy.get('#number-of-results').should(
      'contain.text',
      '11 solutions disponibles'
    )

    // Verify that the page has a pagination component
    cy.get('nav.fr-pagination').should('be.visible')

    // Check that the pagination component has several pages
    cy.get('nav.fr-pagination').within(() => {
      cy.get('a.fr-pagination__link.fr-unhidden-lg').should('have.length', 2)
    })
  })

  it('should display only one page when there are less than 10 results', () => {
    cy.mockResource('topics', solutionFactory.many(1))
    cy.visit('/solutions')
    cy.get('div.topic-card').should('have.length', 1)
    cy.get('#number-of-results').should('contain.text', '1 solution disponible')
    cy.get('nav.fr-pagination').should('be.visible')
    cy.get('nav.fr-pagination').within(() => {
      cy.get('a.fr-pagination__link.fr-unhidden-lg').should('have.length', 1)
    })
  })

  it('should be able to search for a solution', () => {
    cy.expectActionToCallApi(
      () => cy.get('input#search-topic').type('Démarches simplifiées'),
      'topics',
      'q=D%C3%A9marches+simplifi%C3%A9es&tag=simplifions-solutions'
    )
  })

  it('should be able to filter by fournisseurs de service ', () => {
    cy.expectActionToCallApi(
      () => cy.selectFilterValue('À destination de :', 'Communes'),
      'topics',
      'tag=simplifions-fournisseurs-de-service-communes&tag=simplifions-solutions'
    )
  })

  it('should be able to filter by target users ', () => {
    cy.expectActionToCallApi(
      () =>
        cy.selectFilterValue(
          'Pour simplifier les démarches de :',
          'Particuliers'
        ),
      'topics',
      'tag=simplifions-target-users-particuliers&tag=simplifions-solutions'
    )
  })

  it('should be able to filter by budget ', () => {
    cy.expectActionToCallApi(
      () =>
        cy.selectFilterValue(
          'Moyens disponibles pour la mise en œuvre :',
          'Aucun développement, ni budget'
        ),
      'topics',
      'tag=simplifions-budget-aucun-developpement-ni-budget&tag=simplifions-solutions'
    )
  })

  it('should be able to filter by types de simplification ', () => {
    cy.expectActionToCallApi(
      () =>
        cy.selectFilterValue(
          'Type de simplification des démarches :',
          'Accès facile'
        ),
      'topics',
      'tag=simplifions-types-de-simplification-acces-facile&tag=simplifions-solutions'
    )
  })

  it('should not have the private filter', () => {
    cy.get('input[name="include_private"]').should('not.exist')
  })

  describe('when connected with a user', () => {
    beforeEach(() => {
      cy.simulateConnectedUser()
    })

    it('should have the private filter', () => {
      cy.get('input[name="include_private"]').should('exist')
    })

    it('should request the private solutions', () => {
      cy.expectActionToCallApi(
        () => cy.clickCheckbox('include_private'),
        'topics',
        /tag=simplifions-solutions&.+&include_private=true/
      )
    })
  })
})
