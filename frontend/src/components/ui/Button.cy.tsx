import React from 'react'
import { mount } from '@cypress/react18'
import { Button } from './Button'

describe('Button Component - Functional Tests', () => {
  it('renders with text', () => {
    mount(<Button>Click me</Button>)
    cy.contains('Click me').should('be.visible')
  })

  it('handles click events', () => {
    const onClickSpy = cy.spy().as('onClickSpy')
    mount(<Button onClick={onClickSpy}>Click me</Button>)
    
    cy.contains('Click me').click()
    cy.get('@onClickSpy').should('have.been.called')
  })

  it('renders all variants without errors', () => {
    mount(
      <div className="space-y-4">
        <Button variant="default">Default</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="destructive">Destructive</Button>
      </div>
    )
    
    // Just check that all variants render
    cy.contains('Default').should('be.visible')
    cy.contains('Ghost').should('be.visible')
    cy.contains('Outline').should('be.visible')
    cy.contains('Secondary').should('be.visible')
    cy.contains('Destructive').should('be.visible')
  })

  it('renders all sizes without errors', () => {
    mount(
      <div className="space-x-4">
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
        <Button size="icon">Icon</Button>
      </div>
    )
    
    // Just check that all sizes render
    cy.contains('Small').should('be.visible')
    cy.contains('Default').should('be.visible') 
    cy.contains('Large').should('be.visible')
    cy.contains('Icon').should('be.visible')
  })

  it('handles disabled state', () => {
    mount(<Button disabled>Disabled Button</Button>)
    cy.contains('Disabled Button').should('be.disabled')
  })

  it('applies custom classes', () => {
    mount(<Button className="my-custom-class">Custom</Button>)
    cy.contains('Custom').should('have.class', 'my-custom-class')
  })
})