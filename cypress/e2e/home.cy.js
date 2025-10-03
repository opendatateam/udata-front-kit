describe('Home Page', () => {
  beforeEach(() => {
    // Visit the home page before each test
    cy.mockMatomo()
    cy.mockStaticDatagouv()
    cy.mockSentry()
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

  it('should not have console errors', () => {
    // Listen for console errors
    cy.window().then((win) => {
      cy.stub(win.console, 'error').as('consoleError')
    })

    // Reload the page to trigger any potential errors
    cy.reload()

    // Check that no console errors occurred
    cy.get('@consoleError').should('not.have.been.called')
  })
})
