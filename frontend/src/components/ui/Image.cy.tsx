import React from 'react'
import { mount } from '@cypress/react18'
import { Image } from './Image'

describe('Image Component', () => {
  it('renders with required alt text', () => {
    mount(<Image src="/test-image.jpg" alt="Test image" />)
    
    cy.get('img')
      .should('have.attr', 'src', '/test-image.jpg')
      .should('have.attr', 'alt', 'Test image')
      .should('have.attr', 'loading', 'lazy')
  })

  it('sets eager loading when priority is true', () => {
    mount(<Image src="/priority-image.jpg" alt="Priority image" priority />)
    
    cy.get('img').should('have.attr', 'loading', 'eager')
  })

  it('sets lazy loading by default', () => {
    mount(<Image src="/normal-image.jpg" alt="Normal image" />)
    
    cy.get('img').should('have.attr', 'loading', 'lazy')
  })

  it('supports additional HTML img attributes', () => {
    mount(
      <Image 
        src="/test.jpg" 
        alt="Test" 
        width={300}
        height={200}
        className="custom-image"
        data-testid="test-image"
      />
    )
    
    cy.get('img')
      .should('have.attr', 'width', '300')
      .should('have.attr', 'height', '200')
      .should('have.class', 'custom-image')
      .should('have.attr', 'data-testid', 'test-image')
  })

  it('handles error states gracefully', () => {
    const onErrorSpy = cy.spy().as('onErrorSpy')
    
    mount(<Image src="/non-existent.jpg" alt="Missing" onError={onErrorSpy} />)
    
    // Trigger error by trying to load a non-existent image
    cy.get('img').then(($img) => {
      $img[0].onerror = onErrorSpy
      $img[0].src = '/non-existent.jpg'
    })
  })

  it('handles load events', () => {
    const onLoadSpy = cy.spy().as('onLoadSpy')
    
    mount(<Image src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="Test" onLoad={onLoadSpy} />)
    
    cy.get('@onLoadSpy').should('have.been.called')
  })
})