import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4173',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: false,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720,
    setupNodeEvents(on, config) {
      // Dynamically exclude custom site tests that don't match current VITE_SITE_ID
      const siteId = process.env.VITE_SITE_ID

      if (siteId) {
        // Only include tests for the specific site
        config.specPattern = [
          'cypress/e2e/*.cy.{js,jsx,ts,tsx}', // General tests
          `cypress/e2e/custom/${siteId}/**/*.cy.{js,jsx,ts,tsx}` // Site-specific tests
        ]
      } else {
        // If no site ID is set, exclude all custom site tests
        config.excludeSpecPattern = 'cypress/e2e/custom/**/*.cy.{js,jsx,ts,tsx}'
      }

      // use cy.task('log', 'message') to log to terminal
      on('task', {
        log(message) {
          console.log(message)
          return null
        }
      })

      return config
    }
  },
  component: {
    devServer: {
      framework: 'vue',
      bundler: 'vite'
    },
    supportFile: 'cypress/support/component.js',
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}'
  }
})
