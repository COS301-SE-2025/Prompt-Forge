import React from 'react'
import { mount } from '@cypress/react18'
import { Label } from './Label'

describe('Label Component', () => {
  it('renders with text content', () => {
    mount(<Label>Username</Label>)
    
    cy.contains('Username').should('be.visible')
    cy.get('label').should('have.class', 'text-sm')
  })

  it('associates with form inputs via htmlFor', () => {
    mount(
      <div>
        <Label htmlFor="username">Username</Label>
        <input id="username" type="text" />
      </div>
    )
    
    cy.get('label').should('have.attr', 'for', 'username')
    cy.get('label').click()
    cy.get('#username').should('be.focused')
  })

  it('applies custom className', () => {
    mount(<Label className="custom-label">Custom Label</Label>)
    
    cy.contains('Custom Label').should('have.class', 'custom-label')
  })

  it('supports HTML label attributes', () => {
    mount(
      <Label 
        htmlFor="test-input"
        title="Label tooltip"
        data-testid="test-label"
      >
        Test Label
      </Label>
    )
    
    cy.get('[data-testid="test-label"]')
      .should('have.attr', 'for', 'test-input')
      .should('have.attr', 'title', 'Label tooltip')
  })

  it('renders complex content', () => {
    mount(
      <Label>
        <span>Required</span>
        <span style={{ color: 'red' }}>*</span>
      </Label>
    )
    
    cy.contains('Required').should('be.visible')
    cy.contains('*').should('be.visible')
  })

  it('handles click events', () => {
    const onClickSpy = cy.spy().as('onClickSpy')
    
    mount(<Label onClick={onClickSpy}>Clickable Label</Label>)
    
    cy.contains('Clickable Label').click()
    cy.get('@onClickSpy').should('have.been.called')
  })
})