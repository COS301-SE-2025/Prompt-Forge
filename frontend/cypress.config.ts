import { defineConfig } from 'cypress'

export default defineConfig({
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    setupNodeEvents(on, config) {
      // Coverage setup using dynamic import
      import('@cypress/code-coverage/task').then((coverageTask) => {
        coverageTask.default(on, config)
      }).catch(() => {
        // Fallback if coverage is not available
        console.log('Code coverage plugin not available')
      })
      
      // After test run, generate combined report
      on('after:run', (results) => {
        try {
          if (results && 'runs' in results && results.runs) {
            const totalTests = results.runs.reduce((sum, run) => sum + (run.stats?.tests || 0), 0)
            const totalPassed = results.runs.reduce((sum, run) => sum + (run.stats?.passes || 0), 0)
            const totalFailed = results.runs.reduce((sum, run) => sum + (run.stats?.failures || 0), 0)
            const totalSkipped = results.runs.reduce((sum, run) => sum + (run.stats?.skipped || 0), 0)
            const totalDuration = results.runs.reduce((sum, run) => sum + (run.stats?.duration || 0), 0)
            
            console.log('Test Results Summary:')
            console.log(`Total Tests: ${totalTests}`)
            console.log(`Passing: ${totalPassed}`)
            console.log(`Failing: ${totalFailed}`)
            console.log(`Skipped: ${totalSkipped}`)
            console.log(`Duration: ${totalDuration}ms`)
          } else {
            console.log('Test run completed')
          }
        } catch (error) {
          console.log('Error generating test summary:', error)
        }
      })
      
      return config
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.ts',
    indexHtmlFile: 'cypress/support/component-index.html',
    viewportWidth: 1280,
    viewportHeight: 720,
  },
  e2e: {
    baseUrl: 'http://localhost:5173',
    setupNodeEvents(on, config) {
      // Coverage setup using dynamic import
      import('@cypress/code-coverage/task').then((coverageTask) => {
        coverageTask.default(on, config)
      }).catch(() => {
        console.log('Code coverage plugin not available')
      })
      
      return config
    },
  },
  // Global reporter configuration
  reporter: 'mochawesome',
  reporterOptions: {
    reportDir: 'cypress/reports',
    overwrite: false,
    html: true,
    json: true,
    charts: true,
  },
})