describe('Home Page', () => {
  beforeEach(() => {
    // Visit the home page before each test
    cy.mockMatomo()
    cy.mockStaticDatagouv()
    // some site home pages use Grist (eg culture), loosely mock records fetching
    cy.mockGristRecords('*')
    // some site home pages fetch topics (eg ecospheres)
    cy.mockDatagouvObjectList('topics', [])
    cy.visit('/')
  })

  it('should load the home page successfully', () => {
    // Check that the page loads without errors
    cy.url().should('eq', Cypress.config().baseUrl + '/')

    // Wait for the page to load completely
    cy.get('body').should('be.visible')
  })

  it('should display the navigation bar', () => {
    // Check that the banner section exists
    cy.get('header[role="banner"]').should('exist').and('be.visible')
  })

  it('should have a proper page structure', () => {
    // Check that the main container exists
    cy.get('.fr-container').should('exist')
  })

  it('should display search bar if configured', () => {
    // This test will check if search bar exists, but won't fail if it's disabled in config
    cy.get('body').then(($body) => {
      if ($body.find('input#header-select-search').length > 0) {
        cy.get('input#header-select-search').should('be.visible')
        cy.get('input#header-select-search').should('exist')
      } else {
        // Log that search bar is not configured/displayed
        cy.log('Search bar is not configured or not displayed')
      }
    })
  })

  it('should be responsive', () => {
    // Test mobile viewport
    cy.viewport(375, 667)
    cy.get('header[role="banner"]').should('be.visible')
    cy.get('h1').should('be.visible')

    // Test tablet viewport
    cy.viewport(768, 1024)
    cy.get('header[role="banner"]').should('be.visible')
    cy.get('h1').should('be.visible')

    // Test desktop viewport
    cy.viewport(1280, 720)
    cy.get('header[role="banner"]').should('be.visible')
    cy.get('h1').should('be.visible')
  })

  it('should render footer mandatory links with the expected href', () => {
    const mandatoryLinks: { label: string; to?: string; href?: string }[] =
      Cypress.env('siteConfig')?.website?.footer?.mandatory_links ?? []

    mandatoryLinks.forEach((link) => {
      const expectedHref = link.href ?? link.to
      if (!expectedHref) return

      const isExternal = /^(https?:|mailto:)/.test(expectedHref)

      cy.contains('.fr-footer__bottom-link', link.label)
        .should('have.attr', 'href')
        .then((actualHref) => {
          // a `to` pointing to an absolute URL resolves router-relative (prefixed with the
          // current path) instead of navigating out, so make that failure mode explicit
          if (isExternal) {
            expect(
              actualHref,
              'external link must keep an absolute href'
            ).to.match(/^(https?:|mailto:)/)
          }
          expect(actualHref).to.equal(expectedHref)
        })
    })
  })

  it('should not have console errors', () => {
    cy.trackConsoleErrors()
    cy.reload()

    cy.get('h1').should('be.visible')
    cy.contains('p', 'Chargement...').should('not.exist')

    cy.expectNoConsoleErrors()
  })
})
