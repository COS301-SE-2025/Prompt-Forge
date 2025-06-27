/// <reference types="cypress" />

// Add custom commands here
declare global {
  namespace Cypress {
    interface Chainable {
      // Add types for custom commands here
      login(username?: string, password?: string): Chainable<void>
      mockApi(endpoint: string, response: any): Chainable<void>
      dataCy(value: string): Chainable<JQuery<HTMLElement>>
    }
  }
}

// Login command
Cypress.Commands.add('login', (username = 'testuser', password = 'password123') => {
  // Option 1: API login
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      username,
      password
    }
  }).then((response) => {
    // Store the token
    window.localStorage.setItem('token', response.body.token)
    window.localStorage.setItem('username', response.body.username)
    window.localStorage.setItem('userId', response.body.userId)
  })

  // Option 2: Mock login (if you don't have real auth)
  // cy.window().then((win) => {
  //   win.localStorage.setItem('token', 'fake-jwt-token')
  //   win.localStorage.setItem('username', username)
  //   win.localStorage.setItem('userId', '12345')
  // })
})

// Custom API mocking command
Cypress.Commands.add('mockApi', (endpoint: string, response: any) => {
  cy.intercept('GET', `**/api${endpoint}`, response).as('mockApi')
})

// Custom data-cy selector command
Cypress.Commands.add('dataCy', (value: string) => {
  return cy.get(`[data-cy="${value}"]`)
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