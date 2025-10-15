describe('Connected User State', () => {
  beforeEach(() => {
    cy.mockMatomo()
  })

  it('displays user first name and last name on homepage when connected', () => {
    cy.simulateConnectedUser({
      first_name: 'John',
      last_name: 'Doe'
    })

    cy.visit('/')

    cy.contains('John Doe').should('be.visible')
  })
})
