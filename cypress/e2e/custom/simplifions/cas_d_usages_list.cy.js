import { topicCasUsageFactory } from '../../../support/factories/custom/simplifions/topics_factory'
import './support'

describe("Simplifions Cas d'usages Listing Page", () => {
  beforeEach(() => {
    cy.baseMocksForSimplifions()
    cy.mockDatagouvObjectList('topics', topicCasUsageFactory.many(11))
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
    cy.get('#number-of-results').should(
      'contain.text',
      "11 cas d'usages disponibles"
    )

    // Verify that the page has a pagination component
    cy.get('nav.fr-pagination').should('be.visible')

    // Check that the pagination component has several pages
    cy.get('nav.fr-pagination').within(() => {
      cy.get('a.fr-pagination__link.fr-unhidden-lg').should('have.length', 2)
    })
  })

  it('should display only one page when there are less than 10 results', () => {
    cy.mockDatagouvObjectList('topics', topicCasUsageFactory.many(1))
    cy.visit('/cas-d-usages')
    cy.get('div.topic-card').should('have.length', 1)
    cy.get('#number-of-results').should(
      'contain.text',
      "1 cas d'usage disponible"
    )
    cy.get('nav.fr-pagination').should('be.visible')
    cy.get('nav.fr-pagination').within(() => {
      cy.get('a.fr-pagination__link.fr-unhidden-lg').should('have.length', 1)
    })
  })

  it("should be able to search for a cas d'usage", () => {
    cy.expectActionToCallApi(
      () => cy.get('input#search-topic').type('Aides sociales des CCAS'),
      'topics',
      'q=Aides+sociales+des+CCAS&tag=simplifions-v2-cas-d-usages'
    )
  })

  it('should be able to filter by fournisseurs de service ', () => {
    cy.expectActionToCallApi(
      () => cy.selectFilterValue('À destination de :', 'Communes'),
      'topics',
      'tag=simplifions-v2-fournisseurs-de-service-communes&tag=simplifions-v2-cas-d-usages'
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
      'tag=simplifions-v2-target-users-particuliers&tag=simplifions-v2-cas-d-usages'
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
      'tag=simplifions-v2-budget-aucun-developpement-ni-budget&tag=simplifions-v2-cas-d-usages'
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
      'tag=simplifions-v2-types-de-simplification-acces-facile&tag=simplifions-v2-cas-d-usages'
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

    it("should request the private cas d'usages", () => {
      cy.expectActionToCallApi(
        () => cy.clickCheckbox('include_private'),
        'topics',
        /tag=simplifions-v2-cas-d-usages&.+&include_private=true/
      )
    })
  })

  it('should request new results when a filter is applied', () => {
    cy.get('#number-of-results').should(
      'contain.text',
      "11 cas d'usages disponibles"
    )
    cy.get('div.topic-card').should('have.length', 10)

    cy.mockDatagouvObjectList('topics', topicCasUsageFactory.many(3))
    cy.selectFilterValue('À destination de :', 'Communes')

    cy.get('#number-of-results').should(
      'contain.text',
      "3 cas d'usages disponibles"
    )
    cy.get('div.topic-card').should('have.length', 3)
  })
})
