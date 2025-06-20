describe('Landing Page', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('displays the main navigation elements', () => {
    cy.get('nav').should('be.visible')
    cy.contains('Features').should('be.visible')
    cy.contains('How It Works').should('be.visible')
    cy.contains('Pricing').should('be.visible')
    cy.contains('Get Started').should('be.visible')
  })

  it('has working theme toggle', () => {
    cy.get('button[aria-label="Toggle theme"]').click()
    cy.get('html').should('have.class', 'dark')
    cy.get('button[aria-label="Toggle theme"]').click()
    cy.get('html').should('not.have.class', 'dark')
  })

  it('navigates to login page', () => {
    cy.contains('Get Started').click()
    cy.url().should('include', '/login')
  })

  it('displays all main sections', () => {
    cy.contains('The Future of AI Prompt Engineering').should('be.visible')
    cy.contains('The Challenge Every AI User Faces').should('be.visible')
    cy.contains('Everything You Need for Prompt Excellence').should('be.visible')
    cy.contains('How Prompt Forge Works').should('be.visible')
  })
})