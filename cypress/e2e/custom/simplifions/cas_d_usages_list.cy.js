import { topicCasUsageFactory } from '../../../support/factories/custom/simplifions/topics_factory'
import './support'

describe("Simplifions Cas d'usages Listing Page", () => {
  beforeEach(() => {
    cy.baseMocksForSimplifions(topicCasUsageFactory.many(21))
    cy.visit('/cas-d-usages')
  })

  it("should display the cas d'usages listing page correctly", () => {
    // Check that the page body is visible
    cy.get('body').should('be.visible')

    // Verify the page loads and has the correct title
    cy.get('h1').should('contain.text', "Cas d'usages")

    // Verify that the list is not empty
    cy.get('div.topic-card').should('exist')
  })

  it("should display a paginated list of cas d'usages", () => {
    // Verify that the page has 20 results (page size)
    cy.get('div.topic-card').should('have.length', 20)
    cy.get('p[role="status"]').should('contain.text', '21 résultats')

    // Verify that the page has a pagination component
    cy.get('nav.fr-pagination').should('be.visible')

    // Check that the pagination component has 2 page links
    cy.get('nav.fr-pagination').within(() => {
      cy.get('a.fr-pagination__link[title]').should('have.length', 2)
    })
  })

  it('should not display pagination when there is only one page', () => {
    cy.mockDatagouvObjectList('topics', topicCasUsageFactory.many(1))
    cy.visit('/cas-d-usages')
    cy.get('div.topic-card').should('have.length', 1)
    cy.get('p[role="status"]').should('contain.text', '1 résultat')
    cy.get('nav.fr-pagination').should('not.exist')
  })

  it("should be able to search for a cas d'usage", () => {
    cy.expectActionToCallApi(
      () => cy.get('input[name="q"]').type('Aides sociales des CCAS'),
      'topics',
      { q: 'Aides sociales des CCAS', tag: 'simplifions-v2-cas-d-usages' }
    )
  })

  it('should be able to filter by fournisseurs de service ', () => {
    cy.expectActionToCallApi(
      () => cy.selectFilterValue('À destination de :', 'Communes'),
      'topics',
      {
        tag: [
          'simplifions-v2-fournisseurs-de-service-communes',
          'simplifions-v2-cas-d-usages'
        ]
      }
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
      {
        tag: [
          'simplifions-v2-target-users-particuliers',
          'simplifions-v2-cas-d-usages'
        ]
      }
    )
  })

  it('should be able to filter by categorie de solution ', () => {
    cy.expectActionToCallApi(
      () =>
        cy.selectFilterValue(
          'Catégorie de solution :',
          'Logiciel métier "clé en main"'
        ),
      'topics',
      {
        tag: [
          'simplifions-v2-categorie-de-solution-logiciel-metier',
          'simplifions-v2-cas-d-usages'
        ]
      }
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
      {
        tag: [
          'simplifions-v2-types-de-simplification-acces-facile',
          'simplifions-v2-cas-d-usages'
        ]
      }
    )
  })

  // TODO: private filter not yet ported to UnifiedSearchView.vue
  it.skip('should not have the private filter', () => {
    cy.get('input[name="private"]').should('not.exist')
  })

  // TODO: private filter not yet ported to UnifiedSearchView.vue
  describe.skip('when connected with a user', () => {
    beforeEach(() => {
      cy.simulateConnectedUser()
    })

    it('should have the private filter', () => {
      cy.get('input[name="private"]').should('exist')
    })

    it('should send private=false by default and no private param when checked', () => {
      cy.wait('@get_topics_list').then((interception) => {
        // default OFF: private=false
        expect(interception.request.url).to.match(/[?&]private=false(?:&|$)/)
      })
      cy.clickCheckbox('private')
      cy.wait('@get_topics_list').then((interception) => {
        // checked ON: no private param
        expect(interception.request.url).to.not.match(/[?&]private=/)
      })
    })
  })

  it('should request new results when a filter is applied', () => {
    cy.get('p[role="status"]').should('contain.text', '21 résultats')
    cy.get('div.topic-card').should('have.length', 20)

    cy.mockDatagouvObjectList('topics', topicCasUsageFactory.many(3))
    cy.selectFilterValue('À destination de :', 'Communes')

    cy.get('p[role="status"]').should('contain.text', '3 résultats')
    cy.get('div.topic-card').should('have.length', 3)
  })
})
