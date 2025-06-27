
describe('Comparison Page', () => {
  beforeEach(() => {
    cy.visit('/comparison')
  })

  it('allows typing in both prompts', () => {
    cy.get('textarea').first().clear().type('Test prompt A')
    cy.get('textarea').last().clear().type('Test prompt B')
    cy.get('textarea').first().should('have.value', 'Test prompt A')
    cy.get('textarea').last().should('have.value', 'Test prompt B')
  })

  it('tests both prompts', () => {
    cy.get('textarea').first().clear().type('Test prompt')
    cy.get('textarea').last().clear().type('Test prompt')
    cy.contains('Test Both').click()
    cy.contains('Generating response...').should('be.visible')
  })

  it('compares responses', () => {
    cy.get('textarea').first().clear().type('Test prompt')
    cy.get('textarea').last().clear().type('Test prompt')
    cy.contains('Test Both').click()
    cy.contains('Rate').click()
    cy.contains('Analyzing responses...').should('be.visible')
  })

  it('collapses and expands response sections', () => {
    cy.get('button[aria-label="Toggle response A"]').click()
    cy.get('.response-a').should('not.be.visible')
    cy.get('button[aria-label="Toggle response A"]').click()
    cy.get('.response-a').should('be.visible')
  })
})