/// <reference types="cypress" />

// Add custom commands here
declare global {
  namespace Cypress {
    interface Chainable {
      // Add types for custom commands here
      login(email: string, password: string): Chainable<void>
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

// Prevent TypeScript from showing error about adding property to window
export {}