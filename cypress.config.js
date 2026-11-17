import { defineConfig } from 'cypress'
import { readdirSync, readFileSync } from 'fs'
import { load } from 'js-yaml'

export default defineConfig({
  allowCypressEnv: false,
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:4173',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: false,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720,
    setupNodeEvents(on, config) {
      // Dynamically exclude custom site tests that don't match current VITE_SITE_ID
      const siteId = process.env.VITE_SITE_ID

      // Load site config and make it available to tests
      if (siteId) {
        const configPath = `./configs/${siteId}/config.yaml`
        const siteConfig = load(readFileSync(configPath, 'utf-8'))
        config.expose = { ...config.expose, siteConfig, siteId }
      }

      if (siteId) {
        // Exclude other sites' tests
        config.excludeSpecPattern = readdirSync('cypress/e2e/custom')
          .filter((dir) => dir !== siteId)
          .map((dir) => `cypress/e2e/custom/${dir}/**`)
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
