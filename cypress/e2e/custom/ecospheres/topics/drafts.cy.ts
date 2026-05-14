import type { Topic } from '@/model/topic'
import { topicFactory } from 'cypress/support/factories/topics_factory'

describe('Topics - Drafts Page', () => {
  const universeTag =
    Cypress.env('siteConfig').pages.bouquets.universe_query.tag
  const pageSize: number =
    Cypress.env('siteConfig').website.pagination_sizes.topics_drafts_list

  const mockDraftsApi = (
    drafts: Topic[],
    { total, page = 1 }: { total?: number; page?: number } = {}
  ) => {
    cy.intercept('GET', /.*data\.gouv\.fr\/api\/2\/topics.*/, {
      statusCode: 200,
      body: {
        data: drafts,
        total: total ?? drafts.length,
        page,
        page_size: pageSize,
        next_page: null,
        previous_page: null
      }
    }).as('get_drafts')
  }

  beforeEach(() => {
    cy.mockMatomo()
    cy.mockStaticDatagouv()
  })

  describe('when authenticated', () => {
    beforeEach(() => {
      cy.simulateConnectedUser()
    })

    describe('Content', () => {
      it('should display the breadcrumb', () => {
        mockDraftsApi([])
        cy.visit('/admin/bouquets/drafts')
        cy.wait('@get_drafts')
        cy.get('.fr-breadcrumb').contains('Collections').should('be.visible')
        cy.get('.fr-breadcrumb').contains('Mes brouillons').should('be.visible')
      })

      it('should display draft topic cards', () => {
        const drafts = topicFactory.many(3, { overrides: { private: true } })
        mockDraftsApi(drafts)
        cy.visit('/admin/bouquets/drafts')
        cy.wait('@get_drafts')
        drafts.forEach((draft) => {
          cy.contains(draft.name).should('be.visible')
        })
      })

      it('should show the Brouillon badge on each card', () => {
        const drafts = topicFactory.many(2, { overrides: { private: true } })
        mockDraftsApi(drafts)
        cy.visit('/admin/bouquets/drafts')
        cy.wait('@get_drafts')
        cy.get('.fr-badge').contains('Brouillon').should('be.visible')
      })

      it('should send private=true and universe tag to API', () => {
        mockDraftsApi([])
        cy.visit('/admin/bouquets/drafts')
        cy.wait('@get_drafts').then((interception) => {
          expect(interception.request.url).to.match(/[?&]private=true(?:&|$)/)
          expect(interception.request.url).to.match(
            new RegExp(`[?&]tag=${universeTag}(?:&|$)`)
          )
        })
      })
    })

    describe('Empty state', () => {
      it('should show empty message when there are no drafts', () => {
        mockDraftsApi([])
        cy.visit('/admin/bouquets/drafts')
        cy.wait('@get_drafts')
        cy.contains('Aucun brouillon.').should('be.visible')
      })
    })

    describe('Search', () => {
      it('should send q param when submitting the search form', () => {
        const drafts = topicFactory.many(2, { overrides: { private: true } })
        mockDraftsApi(drafts)
        cy.visit('/admin/bouquets/drafts')
        cy.wait('@get_drafts')

        mockDraftsApi([drafts[0]])
        cy.get('.fr-search-bar input').type('test{enter}')
        cy.wait('@get_drafts').then((interception) => {
          expect(interception.request.url).to.match(/[?&]q=test(?:&|$)/)
        })
      })

      it('should auto-search after typing 3 or more characters', () => {
        const drafts = topicFactory.many(2, { overrides: { private: true } })
        mockDraftsApi(drafts)
        cy.visit('/admin/bouquets/drafts')
        cy.wait('@get_drafts')

        mockDraftsApi([drafts[0]])
        cy.get('.fr-search-bar input').type('abc')
        cy.wait('@get_drafts').then((interception) => {
          expect(interception.request.url).to.match(/[?&]q=abc(?:&|$)/)
        })
      })

      it('should show search-specific empty state when search returns no results', () => {
        mockDraftsApi([])
        cy.visit('/admin/bouquets/drafts')
        cy.wait('@get_drafts')

        mockDraftsApi([])
        cy.get('.fr-search-bar input').type('xyz{enter}')
        cy.wait('@get_drafts')
        cy.contains('Aucun brouillon ne correspond à votre recherche.').should(
          'be.visible'
        )
      })

      it('should reload without q param when search is cleared', () => {
        const drafts = topicFactory.many(2, { overrides: { private: true } })
        mockDraftsApi(drafts)
        cy.visit('/admin/bouquets/drafts')
        cy.wait('@get_drafts')

        mockDraftsApi([])
        cy.get('.fr-search-bar input').type('abc')
        cy.wait('@get_drafts')

        mockDraftsApi(drafts)
        cy.get('.fr-search-bar input').clear()
        cy.wait('@get_drafts').then((interception) => {
          expect(interception.request.url).not.to.match(/[?&]q=/)
        })
      })
    })

    describe('Pagination', () => {
      it('should not show pagination when total is within page size', () => {
        const drafts = topicFactory.many(3, { overrides: { private: true } })
        mockDraftsApi(drafts, { total: 3 })
        cy.visit('/admin/bouquets/drafts')
        cy.wait('@get_drafts')
        cy.get('.fr-pagination').should('not.exist')
      })

      it('should show pagination when total exceeds page size', () => {
        const drafts = topicFactory.many(15, { overrides: { private: true } })
        mockDraftsApi(drafts, { total: 30 })
        cy.visit('/admin/bouquets/drafts')
        cy.wait('@get_drafts')
        cy.get('.fr-pagination').should('be.visible')
      })

      it('should request page 2 with correct params when navigating', () => {
        const page1 = topicFactory.many(15, { overrides: { private: true } })
        const page2 = topicFactory.many(5, { overrides: { private: true } })
        mockDraftsApi(page1, { total: 20 })
        cy.visit('/admin/bouquets/drafts')
        cy.wait('@get_drafts')

        mockDraftsApi(page2, { total: 20, page: 2 })
        cy.get('.fr-pagination').contains('2').click()
        cy.wait('@get_drafts').then((interception) => {
          expect(interception.request.url).to.match(/[?&]page=2(?:&|$)/)
        })
        page2.forEach((draft) => {
          cy.contains(draft.name).should('be.visible')
        })
      })
    })
  })
})
