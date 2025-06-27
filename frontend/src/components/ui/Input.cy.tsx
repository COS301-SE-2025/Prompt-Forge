import React from 'react'
import { mount } from '@cypress/react18'
import { Input } from './Input'

describe('Input Component - Current Functionality', () => {
  it('renders with default styling', () => {
    mount(<Input placeholder="Enter text..." />)
    
    cy.get('input')
      .should('have.attr', 'placeholder', 'Enter text...')
      .should('have.class', 'flex')
      .should('have.class', 'h-10')
      .should('have.class', 'w-full')
  })

  it('handles displayBorder prop', () => {
    // Test with border
    mount(<Input displayBorder={true} data-cy="with-border" />)
    cy.get('[data-cy="with-border"]').should('have.class', 'border')
    
    // Test without border
    mount(<Input displayBorder={false} data-cy="without-border" />)
    cy.get('[data-cy="without-border"]').should('not.have.class', 'border')
  })

  it('supports input functionality', () => {
    mount(<Input data-cy="functional-input" />)
    
    cy.get('[data-cy="functional-input"]')
      .type('Test input')
      .should('have.value', 'Test input')
  })

  it('forwards HTML input props', () => {
    mount(
      <Input 
        type="email"
        placeholder="Email"
        required
        disabled={false}
        data-cy="props-input"
      />
    )
    
    cy.get('[data-cy="props-input"]')
      .should('have.attr', 'type', 'email')
      .should('have.attr', 'placeholder', 'Email')
      .should('have.attr', 'required')
      .should('not.be.disabled')
  })
})