import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { mount } from '@cypress/react18'
import { StandardPromptCard } from '../StandardPromptCard'

const mockPromptData = {
  id: '123',
  title: 'Test Prompt',
  description: 'This is a test prompt description',
  rating: 4.5,
  uses: 100,
  price: 9.99,
  featured: false,
  isPrivate: false,
  isFavorite: false,
  tags: ['AI', 'Testing', 'React'],
  category: 'Development',
  authorName: 'Test Author',
  isOwned: false,
  isPublished: true,
  content: 'Test prompt content'
}

const WrappedCard = (props: any) => (
  <BrowserRouter>
    <StandardPromptCard {...props} />
  </BrowserRouter>
)

describe('StandardPromptCard Component - Simplified', () => {
  it('renders basic prompt information', () => {
    mount(<WrappedCard {...mockPromptData} />)
    
    cy.contains('Test Prompt').should('be.visible')
    cy.contains('Test Author').should('be.visible')
    cy.contains('$9.99').should('be.visible')
  })

  it('displays tags correctly', () => {
    mount(<WrappedCard {...mockPromptData} />)
    
    cy.contains('AI').should('be.visible')
    cy.contains('Testing').should('be.visible')
  })

  it('handles zero price without breaking', () => {
    mount(<WrappedCard {...mockPromptData} price={0} />)
    
    // Simple test: component renders and doesn't show original price
    cy.contains('Test Prompt').should('be.visible')
    cy.get('body').should('not.contain.text', '$9.99')
  })

  it('component has interactive elements', () => {
    mount(<WrappedCard {...mockPromptData} />)
    
    cy.get('button').should('exist')
    cy.contains('Test Prompt').should('be.visible')
  })

  it('debug what zero price actually shows', () => {
    mount(<WrappedCard {...mockPromptData} price={0} />)
    
    cy.get('body').invoke('text').then((text) => {
      cy.log('Component content:', text)
    })
  })
})