import React from 'react'
import { mount } from '@cypress/react18'
import { Badge } from './Badge'

describe('Badge Component', () => {
  it('renders with default variant', () => {
    mount(<Badge>Default Badge</Badge>)
    
    cy.contains('Default Badge').should('be.visible')
    cy.get('div').should('have.class', 'inline-flex')
    cy.get('div').should('have.class', 'rounded-full')
  })

  it('renders all variants correctly', () => {
    mount(
      <div className="space-x-2">
        <Badge variant="default">Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="outline">Outline</Badge>
      </div>
    )
    
    cy.contains('Default').should('be.visible')
    cy.contains('Secondary').should('be.visible')
    cy.contains('Destructive').should('be.visible')
    cy.contains('Outline').should('be.visible')
  })

  it('applies custom className', () => {
    mount(<Badge className="custom-badge">Custom</Badge>)
    
    cy.contains('Custom').should('have.class', 'custom-badge')
  })

  it('supports HTML div attributes', () => {
    mount(
      <Badge 
        title="Test badge" 
        data-testid="badge-test"
        onClick={() => {}}
      >
        Clickable Badge
      </Badge>
    )
    
    cy.contains('Clickable Badge')
      .should('have.attr', 'title', 'Test badge')
      .should('have.attr', 'data-testid', 'badge-test')
  })

  it('handles click events', () => {
    const onClickSpy = cy.spy().as('onClickSpy')
    
    mount(<Badge onClick={onClickSpy}>Clickable</Badge>)
    
    cy.contains('Clickable').click()
    cy.get('@onClickSpy').should('have.been.called')
  })

  it('renders with complex content', () => {
    mount(
      <Badge>
        <span>🎉</span> Success Badge
      </Badge>
    )
    
    cy.contains('🎉 Success Badge').should('be.visible')
  })
})