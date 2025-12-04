// ***********************************************
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

import './authentication.js'
import './filters.js'

Cypress.Commands.add('checkRGAAContrast', (context = null, options = {}) => {
  cy.checkA11y(context, {
    runOnly: {
      type: 'rule',
      values: ['color-contrast']
    },
    rules: {
      'color-contrast': {
        enabled: true,
        options: {
          largeTextPt: 24, // RGAA: text must be 24px+ to be "large"
          boldTextPt: 18.5, // RGAA: bold text must be 18.5px+ to be "large"
          ...options
        }
      }
    }
  })
})

Cypress.Commands.add(
  'isInViewport',
  { prevSubject: true },
  (subject, options = {}) => {
    const threshold = options.threshold || 0
    const wait = options.wait || 0

    const checkViewport = () => {
      const rect = subject[0].getBoundingClientRect()
      const win = subject[0].ownerDocument.defaultView

      // Check if at least part of the element is visible in viewport
      const isVisible =
        rect.top < win.innerHeight - threshold &&
        rect.bottom > threshold &&
        rect.left < win.innerWidth - threshold &&
        rect.right > threshold

      const assertion = expect(
        isVisible,
        `Expected element to be in viewport (threshold: ${threshold}px). ` +
          `Element rect: top=${rect.top}, bottom=${rect.bottom}, left=${rect.left}, right=${rect.right}. ` +
          `Viewport: width=${win.innerWidth}, height=${win.innerHeight}`
      ).to.be.true
      return assertion
    }

    // Wait for animations/scrolling to complete if specified
    if (wait > 0) {
      cy.wait(wait).then(checkViewport)
    } else {
      checkViewport()
    }
  }
)
