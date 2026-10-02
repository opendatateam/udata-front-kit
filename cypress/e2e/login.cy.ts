describe('Login', () => {
  beforeEach(() => {
    cy.mockMatomo()
    cy.mockStaticDatagouv()
    cy.mockGristRecords('*')
    cy.mockDatagouvObjectList('topics', [])
  })

  it('redirects to home with a toast when localStorage is unavailable', () => {
    if (Cypress.env('siteConfig')?.website?.oauth_option !== true) {
      cy.log('oauth is not configured for this site, skipping')
      return
    }

    cy.trackConsoleErrors()
    cy.on('window:before:load', (win) => {
      // simulate a browser blocking storage access
      const throwSecurityError = () => {
        throw new DOMException('The operation is insecure.', 'SecurityError')
      }
      cy.stub(win.localStorage, 'getItem').callsFake(throwSecurityError)
      cy.stub(win.localStorage, 'setItem').callsFake(throwSecurityError)
      cy.stub(win.localStorage, 'removeItem').callsFake(throwSecurityError)
    })

    cy.visit('/login')

    cy.url().should('eq', `${Cypress.config().baseUrl}/`)
    cy.get('[data-sonner-toast][data-type="error"]')
      .should('be.visible')
      .and('contain.text', 'stockage local')

    cy.expectNoConsoleErrors()
  })
})
