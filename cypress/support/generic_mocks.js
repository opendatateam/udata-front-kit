const allowedDomains = [
  'localhost',
  '127.0.0.1',
  // These domains are allowed for when running tests with Chrome
  'content-autofill.googleapis.com',
  'android.clients.google.com'
]

Cypress.Commands.add('catchUnmockedRequests', () => {
  const escapedDomains = allowedDomains
    .map((domain) => domain.replace(/\./g, '\\.'))
    .join('|')
  const regex = new RegExp(`^https?:\\/\\/(?!(${escapedDomains})(:|\/|$)).*`)

  cy.intercept(regex, (req) => {
    throw new Error(
      `Unmocked external API call detected: ${req.method} ${req.url}`
    )
  }).as('catchExternalRequests')
})

Cypress.Commands.add('allowExternalRequests', () => {
  cy.intercept('**', (req) => {
    req.continue()
  }).as('catchExternalRequests')
})
