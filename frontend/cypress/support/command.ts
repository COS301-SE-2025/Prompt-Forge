/// <reference types="cypress" />

// Add custom commands here
declare global {
  namespace Cypress {
    interface Chainable {
      // Add types for custom commands here
      login(email: string, password: string): Chainable<void>
      dataCy(value: string): Chainable<JQuery<HTMLElement>>
    }
  }
}

// Example custom command
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login')
  cy.get('input[type="email"]').type(email)
  cy.get('input[type="password"]').type(password)
  cy.contains('button', 'Login').click()
})

// Custom commands can be added here

// Example: Add data-cy command
Cypress.Commands.add('dataCy', (value: string) => {
  return cy.get(`[data-cy=${value}]`)
})

declare global {
  namespace Cypress {
    interface Chainable {
      dataCy(value: string): Chainable<JQuery<HTMLElement>>
    }
  }
}

// Prevent TypeScript from showing error about adding property to window
export {}