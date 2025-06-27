
import { mount } from '@cypress/react18'

// Augment the Cypress namespace to include type definitions for
// your custom command.
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount
      login(username: string, userId: string): Chainable<void>
      mockApi(endpoint: string, response: any): Chainable<void>
      dataCy(value: string): Chainable<JQuery<HTMLElement>>
    }
  }
}

// Mount command
Cypress.Commands.add('mount', mount)

// Custom login command
Cypress.Commands.add('login', (username: string, userId: string) => {
  cy.window().then((win) => {
    win.localStorage.setItem('username', username)
    win.localStorage.setItem('userId', userId)
  })
})

// Custom API mocking command
Cypress.Commands.add('mockApi', (endpoint: string, response: any) => {
  cy.intercept('GET', `**/${endpoint}`, response).as(`mock${endpoint}`)
})

// Data-cy selector command
Cypress.Commands.add('dataCy', (value: string) => {
  return cy.get(`[data-cy=${value}]`)
})