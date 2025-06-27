import React from 'react'
import { mount } from '@cypress/react18'
import { Card } from './Card'

describe('Card Component', () => {
  it('renders with default styling', () => {
    mount(
      <Card>
        <h2>Card Title</h2>
        <p>Card content goes here</p>
      </Card>
    )
    
    cy.contains('Card Title').should('be.visible')
    cy.contains('Card content goes here').should('be.visible')
    cy.get('div').should('have.class', 'rounded-lg')
    cy.get('div').should('have.class', 'border')
  })

  it('applies custom className', () => {
    mount(<Card className="custom-card">Custom Card</Card>)
    
    cy.contains('Custom Card').should('have.class', 'custom-card')
  })

  it('supports HTML div attributes', () => {
    mount(
      <Card 
        data-testid="test-card"
        title="Test Card"
        onClick={() => {}}
      >
        Interactive Card
      </Card>
    )
    
    cy.get('[data-testid="test-card"]')
      .should('have.attr', 'title', 'Test Card')
      .should('contain', 'Interactive Card')
  })

  it('handles click events', () => {
    const onClickSpy = cy.spy().as('onClickSpy')
    
    mount(<Card onClick={onClickSpy}>Clickable Card</Card>)
    
    cy.contains('Clickable Card').click()
    cy.get('@onClickSpy').should('have.been.called')
  })

  it('renders complex nested content', () => {
    mount(
      <Card>
        <div className="card-header">
          <h3>Header</h3>
        </div>
        <div className="card-body">
          <p>Body content</p>
          <button>Action</button>
        </div>
      </Card>
    )
    
    cy.contains('Header').should('be.visible')
    cy.contains('Body content').should('be.visible')
    cy.contains('Action').should('be.visible')
  })
})