const allowedDomains = [
  'localhost',
  '127.0.0.1',
  // These domains are allowed for when running tests with Chrome
  // it's eye opening to maintain this list... 🕵️‍♀️
  'content-autofill.googleapis.com',
  'optimizationguide-pa.googleapis.com',
  'clientservices.googleapis.com',
  'www.google.com',
  'android.clients.google.com',
  'safebrowsing.googleapis.com',
  'accounts.google.com',
  '*.gvt1.com'
]

Cypress.Commands.add('catchUnmockedRequests', () => {
  cy.intercept('*', (req) => {
    const { hostname } = new URL(req.url)
    const allowed = allowedDomains.some((domain) =>
      domain.startsWith('*.')
        ? hostname.endsWith(domain.slice(1))
        : hostname === domain
    )
    if (!allowed) {
      throw new Error(
        `Unmocked external API call detected: ${req.method} ${req.url}`
      )
    }
  }).as('catchExternalRequests')
})

Cypress.Commands.add('allowExternalRequests', () => {
  cy.intercept('**', (req) => {
    req.continue()
  }).as('catchExternalRequests')
})
