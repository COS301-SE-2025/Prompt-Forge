describe('PromptDetails Page', () => {
  beforeEach(() => {
    cy.session('jwt-login', () => {
      cy.login();
    });
    cy.visit('/prompt/1ddb580d-2454-46d2-9f5a-f6f257edad6c');
  })

  describe('Page Loading', () => {
    it('should display loading spinner initially', () => {
      cy.get('.animate-spin').should('exist')
      cy.contains('Loading prompt...').should('be.visible')
    })

    it('should load prompt data successfully', () => {
      cy.intercept("GET", "/prompts/1ddb580d-2454-46d2-9f5a-f6f257edad6c", {
        statusCode: 200,
        // body: { message: "Email aready exists" },
      }).as("getPrompt");

      cy.intercept("GET", "/store/prompts/1ddb580d-2454-46d2-9f5a-f6f257edad6c/reviews", {
        statusCode: 200,
      }).as("getReviews");

      cy.intercept("GET", "/store/prompts/ownership/1ddb580d-2454-46d2-9f5a-f6f257edad6c/reviews", {
        statusCode: 200,
      }).as("getOwnership");

      cy.intercept("GET", "/cart/added/1ddb580d-2454-46d2-9f5a-f6f257edad6c/reviews", {
        statusCode: 200,
      }).as("getAddedToCart");

      cy.wait('@getPrompt')
      cy.wait('@getReviews')
      cy.wait('@getOwnership')
      cy.wait('@getAddedToCart')


      cy.get('.animate-spin').should('exist')

      // Check that main content is visible
      cy.get('h1').should('contain.text', 'Creative')
      // cy.get('[data-testid="prompt-description"]').should('exist')
    })

    it('should display error state when API fails', () => {
      cy.intercept('GET', '/api/store/prompts/*', { statusCode: 500 }).as('getPromptError')
      cy.visit('/prompt/invalid-id')

      cy.wait('@getPromptError')
      cy.contains('Error Loading Prompt').should('be.visible')
      cy.contains('Try Again').should('be.visible')
    })

    it('should display not found state for non-existent prompt', () => {
      cy.intercept('GET', '/api/store/prompts/*', { statusCode: 404 }).as('getPromptNotFound')
      cy.visit('/prompt/non-existent-id')

      cy.wait('@getPromptNotFound')
      cy.contains('Prompt Not Found').should('be.visible')
      cy.contains('Back to Marketplace').should('be.visible')
    })
  })

  describe('Breadcrumb Navigation', () => {
    it('should display breadcrumb navigation', () => {
      cy.wait('@getPrompt')

      cy.get('nav').within(() => {
        cy.contains('Marketplace').should('have.attr', 'href', '/marketplace')
        cy.contains('Test Prompt Title').should('be.visible')
      })
    })

    it('should include tags in breadcrumb when available', () => {
      cy.wait('@getPrompt')

      cy.get('nav').within(() => {
        cy.contains('AI Writing').should('have.attr', 'href').and('include', 'tag=AI Writing')
        cy.contains('Productivity').should('exist')
      })
    })
  })

  describe('Prompt Information Display', () => {
    it('should display prompt title and metadata', () => {
      cy.wait('@getPrompt')

      cy.get('h1').should('contain.text', 'Test Prompt Title')
      cy.contains('Published').should('be.visible')
      cy.get('[data-testid="star-rating"]').should('exist')
    })

    it('should display tags', () => {
      cy.wait('@getPrompt')

      cy.get('.bg-blue-100').should('contain.text', 'AI Writing')
      cy.get('.bg-blue-100').should('contain.text', 'Productivity')
    })

    it('should display premium badge for paid prompts', () => {
      // Mock paid prompt
      cy.intercept('GET', '/api/store/prompts/*', {
        fixture: 'paid-prompt-details.json'
      }).as('getPaidPrompt')

      cy.visit('/prompt/paid-prompt-id')
      cy.wait('@getPaidPrompt')

      cy.contains('Premium').should('be.visible')
    })

    it('should display description section', () => {
      cy.wait('@getPrompt')

      cy.contains('Description').should('be.visible')
      cy.get('[data-testid="prompt-description"]')
        .should('contain.text', 'This is a test prompt description')
    })
  })

  describe('Prompt Content Access', () => {
    it('should show prompt content for free prompts', () => {
      cy.wait('@getPrompt')

      cy.contains('Prompt').should('be.visible')
      cy.get('.font-mono').should('contain.text', 'Test prompt content here')
    })

    it('should show premium content message for paid prompts user does not own', () => {
      cy.intercept('GET', '/api/store/prompts/*', {
        body: {
          id: 'paid-prompt-id',
          title: 'Paid Prompt',
          price: 9.99,
          ownership: false,
          content: 'Hidden content'
        }
      }).as('getPaidPromptNotOwned')

      cy.visit('/prompt/paid-prompt-id')
      cy.wait('@getPaidPromptNotOwned')

      cy.contains('Premium Content').should('be.visible')
      cy.contains('This prompt is premium content').should('be.visible')
      cy.get('.font-mono').should('not.exist')
    })

    it('should show content for owned paid prompts', () => {
      cy.intercept('GET', '/api/store/prompts/*', {
        body: {
          id: 'owned-prompt-id',
          title: 'Owned Prompt',
          price: 9.99,
          ownership: true,
          content: 'Visible content for owner'
        }
      }).as('getOwnedPrompt')

      cy.visit('/prompt/owned-prompt-id')
      cy.wait('@getOwnedPrompt')

      cy.get('.font-mono').should('contain.text', 'Visible content for owner')
    })
  })

  describe('Purchase Functionality', () => {
    it('should display correct price', () => {
      cy.wait('@getPrompt')

      cy.contains('Price').should('be.visible')
      cy.contains('Free').should('be.visible') // For free prompt
    })

    it('should show purchase button for unowned paid prompts', () => {
      cy.intercept('GET', '/api/store/prompts/*', {
        body: {
          id: 'paid-prompt-id',
          title: 'Paid Prompt',
          price: 9.99,
          ownership: false,
          addedToCart: false
        }
      }).as('getPaidPrompt')

      cy.visit('/prompt/paid-prompt-id')
      cy.wait('@getPaidPrompt')

      cy.contains('$9.99').should('be.visible')
      cy.get('[data-testid="purchase-button"]').should('contain.text', 'Add to Cart')
    })

    it('should handle purchase/add to cart action', () => {
      cy.intercept('GET', '/api/store/prompts/*', {
        body: {
          id: 'paid-prompt-id',
          price: 9.99,
          ownership: false,
          addedToCart: false
        }
      }).as('getPaidPrompt')

      cy.visit('/prompt/paid-prompt-id')
      cy.wait('@getPaidPrompt')

      cy.get('[data-testid="purchase-button"]').click()
      cy.wait('@addToCart')

      // Should show success alert
      cy.on('window:alert', (text) => {
        expect(text).to.contains('Added to cart successfully')
      })
    })

    it('should show owned status for owned prompts', () => {
      cy.intercept('GET', '/api/store/prompts/*', {
        body: {
          id: 'owned-prompt-id',
          ownership: true,
          price: 9.99
        }
      }).as('getOwnedPrompt')

      cy.visit('/prompt/owned-prompt-id')
      cy.wait('@getOwnedPrompt')

      cy.contains('✓ Owned').should('be.visible')
    })

    it('should show added to cart status', () => {
      cy.intercept('GET', '/api/store/prompts/*', {
        body: {
          id: 'cart-prompt-id',
          ownership: false,
          addedToCart: true,
          price: 9.99
        }
      }).as('getCartPrompt')

      cy.visit('/prompt/cart-prompt-id')
      cy.wait('@getCartPrompt')

      cy.contains('✓ Added to cart').should('be.visible')
    })
  })

  describe('Reviews Section', () => {
    it('should display reviews section', () => {
      cy.wait(['@getPrompt', '@getReviews'])

      cy.contains('Reviews').should('be.visible')
      cy.get('[data-testid="star-rating"]').should('exist')
      cy.contains('review').should('be.visible')
    })

    it('should display individual reviews', () => {
      cy.wait(['@getPrompt', '@getReviews'])

      cy.get('[data-testid="review-card"]').should('have.length.greaterThan', 0)
      cy.get('[data-testid="review-card"]').first().within(() => {
        cy.get('[data-testid="reviewer-name"]').should('be.visible')
        cy.get('[data-testid="review-rating"]').should('exist')
        cy.get('[data-testid="review-comment"]').should('be.visible')
      })
    })

    it('should show no reviews message when no reviews exist', () => {
      cy.intercept('GET', '/api/store/prompts/*/reviews', { body: [] }).as('getNoReviews')
      cy.visit('/prompt/no-reviews-id')

      cy.wait(['@getPrompt', '@getNoReviews'])

      cy.contains('No reviews yet').should('be.visible')
      cy.contains('Be the first to review').should('be.visible')
    })

    it('should display review form for accessible prompts', () => {
      cy.wait(['@getPrompt', '@getReviews'])

      cy.get('[data-testid="review-form"]').should('be.visible')
      cy.get('[data-testid="rating-input"]').should('exist')
      cy.get('[data-testid="comment-input"]').should('exist')
      cy.get('[data-testid="submit-review"]').should('exist')
    })

    it('should not show review form for inaccessible paid prompts', () => {
      cy.intercept('GET', '/api/store/prompts/*', {
        body: {
          id: 'paid-prompt-id',
          price: 9.99,
          ownership: false
        }
      }).as('getPaidPromptNotOwned')

      cy.visit('/prompt/paid-prompt-id')
      cy.wait('@getPaidPromptNotOwned')

      cy.get('[data-testid="review-form"]').should('not.exist')
    })

    it('should submit review successfully', () => {
      // Mock localStorage token
      cy.window().then((win) => {
        win.localStorage.setItem('token', 'fake-token')
      })

      cy.wait(['@getPrompt', '@getReviews'])

      cy.get('[data-testid="rating-input"]').click()
      cy.get('[data-testid="rating-star-5"]').click()
      cy.get('[data-testid="comment-input"]').type('Great prompt!')
      cy.get('[data-testid="submit-review"]').click()

      cy.wait('@submitReview')

      // Should refresh reviews after submission
      cy.wait('@getReviews')
    })
  })

  describe('Sidebar Information', () => {
    it('should display author information', () => {
      cy.wait('@getPrompt')

      cy.contains('Author').should('be.visible')
      cy.contains('@').should('be.visible') // Author ID display
    })

    it('should display stats', () => {
      cy.wait(['@getPrompt', '@getReviews'])

      cy.contains('Stats').should('be.visible')
      cy.contains('Reviews').should('be.visible')
      cy.contains('Rating').should('be.visible')
    })

    it('should display clickable tags in sidebar', () => {
      cy.wait('@getPrompt')

      cy.contains('Tags').should('be.visible')
      cy.get('.bg-gray-100').should('have.attr', 'href').and('include', 'marketplace?tag=')
    })
  })

  describe('Responsive Design', () => {
    it('should display properly on mobile', () => {
      cy.viewport('iphone-6')
      cy.wait('@getPrompt')

      cy.get('h1').should('be.visible')
      cy.get('.lg\\:col-span-2').should('exist')
      cy.get('.lg\\:col-span-1').should('exist')
    })

    it('should display properly on tablet', () => {
      cy.viewport('ipad-2')
      cy.wait('@getPrompt')

      cy.get('.grid-cols-1').should('exist')
      cy.get('.lg\\:grid-cols-3').should('exist')
    })
  })

  describe('Error Handling', () => {
    it('should handle review submission error', () => {
      cy.intercept('POST', '/api/store/prompts/*/reviews', {
        statusCode: 500
      }).as('submitReviewError')

      cy.window().then((win) => {
        win.localStorage.setItem('token', 'fake-token')
      })

      cy.wait(['@getPrompt', '@getReviews'])

      cy.get('[data-testid="rating-star-5"]').click()
      cy.get('[data-testid="comment-input"]').type('Test review')
      cy.get('[data-testid="submit-review"]').click()

      cy.wait('@submitReviewError')

      cy.on('window:alert', (text) => {
        expect(text).to.contains('Failed to submit review')
      })
    })

    it('should handle add to cart error', () => {
      cy.intercept('POST', '/api/cart/add', {
        statusCode: 500,
        body: { message: 'Cart error' }
      }).as('addToCartError')

      cy.intercept('GET', '/api/store/prompts/*', {
        body: {
          id: 'paid-prompt-id',
          price: 9.99,
          ownership: false,
          addedToCart: false
        }
      }).as('getPaidPrompt')

      cy.visit('/prompt/paid-prompt-id')
      cy.wait('@getPaidPrompt')

      cy.get('[data-testid="purchase-button"]').click()
      cy.wait('@addToCartError')

      cy.on('window:alert', (text) => {
        expect(text).to.contains('Cart error')
      })
    })
  })

  describe('Navigation Links', () => {
    it('should navigate back to marketplace from breadcrumb', () => {
      cy.wait('@getPrompt')

      cy.get('nav a[href="/marketplace"]').click()
      cy.url().should('include', '/marketplace')
    })

    it('should navigate back to marketplace from not found page', () => {
      cy.intercept('GET', '/api/store/prompts/*', { statusCode: 404 }).as('getPromptNotFound')
      cy.visit('/prompt/non-existent-id')

      cy.wait('@getPromptNotFound')
      cy.contains('Back to Marketplace').click()
      cy.url().should('include', '/marketplace')
    })

    it('should navigate to filtered marketplace from tag clicks', () => {
      cy.wait('@getPrompt')

      cy.get('a[href*="marketplace?tag="]').first().click()
      cy.url().should('include', 'marketplace?tag=')
    })
  })
})