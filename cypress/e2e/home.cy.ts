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

  it('should not have console errors', () => {
    // Use window:before:load so the stub is set on the NEW window before any
    // app code runs — cy.stub() on the old window wouldn't survive a reload.
    cy.on('window:before:load', (win) => {
      cy.stub(win.console, 'error').as('consoleError')
    })

    // Reload the page to trigger any potential errors
    cy.reload()

    // app.mount() runs inside routerPromise.then(), so Vue mounts asynchronously
    // after cy.reload() resolves. Wait for the h1 to confirm mounting is done,
    // then wait for any async data fetching (e.g. Grist on the culture site).
    cy.get('h1').should('be.visible')
    cy.contains('p', 'Chargement...').should('not.exist')

    cy.get('@consoleError').then((rawStub) => {
      const stub = rawStub as unknown as sinon.SinonSpy
      if (stub.called) {
        throw new Error(
          `console.error was called ${stub.callCount} time(s):\n${stub.args.map((a: unknown[], i: number) => `Call ${i + 1}: ${JSON.stringify(a)}`).join('\n')}`
        )
      }
    })
  })
})
