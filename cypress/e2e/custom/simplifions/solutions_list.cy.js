import { topicSolutionFactory } from '../../../support/factories/custom/simplifions/topics_factory'
import './support'

describe('Simplifions Solutions Page', () => {
  beforeEach(() => {
    cy.baseMocksForSimplifions()
    cy.mockDatagouvObjectList('topics', topicSolutionFactory.many(11))
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

  it('should display only one page when there is only one result', () => {
    cy.mockDatagouvObjectList('topics', topicSolutionFactory.many(1))
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
      'q=D%C3%A9marches+simplifi%C3%A9es&tag=simplifions-v2-solutions'
    )
  })

  it('should be able to filter by fournisseurs de service ', () => {
    cy.expectActionToCallApi(
      () => cy.selectFilterValue('À destination de :', 'Communes'),
      'topics',
      'tag=simplifions-v2-fournisseurs-de-service-communes&tag=simplifions-v2-solutions'
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
      'tag=simplifions-v2-target-users-particuliers&tag=simplifions-v2-solutions'
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
      'tag=simplifions-v2-budget-aucun-developpement-ni-budget&tag=simplifions-v2-solutions'
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
      'tag=simplifions-v2-types-de-simplification-acces-facile&tag=simplifions-v2-solutions'
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
        /tag=simplifions-v2-solutions&.+&include_private=true/
      )
    })
  })

  it('should request new results when a filter is applied', () => {
    cy.get('#number-of-results').should(
      'contain.text',
      '11 solutions disponibles'
    )
    cy.get('div.topic-card').should('have.length', 10)

    cy.mockDatagouvObjectList('topics', topicSolutionFactory.many(3))
    cy.selectFilterValue('À destination de :', 'Communes')

    cy.get('#number-of-results').should(
      'contain.text',
      '3 solutions disponibles'
    )
    cy.get('div.topic-card').should('have.length', 3)
  })

  it('should display images from Grist for solutions', () => {
    cy.mockDatagouvObjectList(
      'topics',
      topicSolutionFactory.many(1, {
        overrides: {
          extras: {
            'simplifions-v2-solutions': {
              Image: ['123']
            }
          }
        }
      })
    )

    cy.get('img.card-image').should('have.length', 1)
    cy.get('img.card-image')
      .should('have.attr', 'src')
      .and(
        'match',
        /https:\/\/grist\.numerique\.gouv\.fr\/api\/docs\/.+\/attachments\/123\/download/
      )
  })

  it('should display the first operator name and public/privatefrom the extras', () => {
    cy.mockDatagouvObjectList(
      'topics',
      topicSolutionFactory.many(1, {
        overrides: {
          extras: {
            'simplifions-v2-solutions': {
              Nom_de_l_operateur: ['First Operator', 'Second Operator'],
              Public_ou_prive: 'Public'
            }
          }
        }
      })
    )

    cy.get('.topic-card').should('contain.text', 'First Operator')
    cy.get('.topic-card').should('not.contain.text', 'Second Operator')
    cy.get('.topic-card').should('contain.text', 'Solution publique')
  })
})
