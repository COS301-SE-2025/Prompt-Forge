// Cart e2e tests for Prompt Forge

describe('Cart Page', () => {
    beforeEach(() => {
        cy.session('jwt-login', () => {
            cy.login();
        });
    });

    it('should display empty cart message', () => {
        cy.intercept('GET', '/cart', { statusCode: 200, body: { content: [] } }).as('getCart');
        cy.visit('/cart');
        cy.wait('@getCart');
        cy.contains('Your cart is empty').should('be.visible');
        cy.contains('Explore Marketplace').should('be.visible');
    });

    it('should display cart items', () => {
        cy.intercept('GET', '/cart', {
            statusCode: 200,
            body: {
                content: [
                    {
                        cartItemId: 'cart-1',
                        promptId: 'prompt-1',
                        promptTitle: 'Prompt A',
                        promptTags: ['Writing'],
                        promptPrice: 9.99,
                        reviewCount: 2,
                        averageRating: 4.5,
                        username: 'userA',
                    },
                    {
                        cartItemId: 'cart-2',
                        promptId: 'prompt-2',
                        promptTitle: 'Prompt B',
                        promptTags: ['Design'],
                        promptPrice: 5.00,
                        reviewCount: 0,
                        averageRating: 0,
                        username: 'userB',
                    },
                ],
            },
        }).as('getCart');
        cy.intercept('GET', '/store/prompts/*/rating-summary', { statusCode: 200, body: { averageRating: 4.5, reviewCount: 2 } });
        cy.visit('/cart');
        cy.wait('@getCart');
        cy.contains('Prompt A').should('be.visible');
        cy.contains('Prompt B').should('be.visible');
        cy.contains('Subtotal').should('be.visible');
        cy.contains('$14.99').should('be.visible');
    });

    it('should remove an item from the cart', () => {
        cy.intercept('GET', '/cart', {
            statusCode: 200,
            body: {
                content: [
                    {
                        cartItemId: 'cart-1',
                        promptId: 'prompt-1',
                        promptTitle: 'Prompt A',
                        promptTags: ['Writing'],
                        promptPrice: 9.99,
                        reviewCount: 2,
                        averageRating: 4.5,
                        username: 'userA',
                    },
                ],
            },
        }).as('getCart');
        cy.intercept('GET', '/store/prompts/*/rating-summary', { statusCode: 200, body: { averageRating: 4.5, reviewCount: 2 } });
        cy.intercept('POST', '/cart/remove/*', { statusCode: 200, body: { message: 'Removed from cart' } }).as('removeFromCart');
        cy.visit('/cart');
        cy.wait('@getCart');
        cy.contains('Prompt A').should('be.visible');
        cy.get('button').contains('Remove').click({ force: true });
        cy.wait('@removeFromCart');
        cy.contains('Your cart is empty').should('be.visible');
    });

    it('should checkout successfully', () => {
        cy.intercept('GET', '/cart', {
            statusCode: 200,
            body: {
                content: [
                    {
                        cartItemId: 'cart-1',
                        promptId: 'prompt-1',
                        promptTitle: 'Prompt A',
                        promptTags: ['Writing'],
                        promptPrice: 9.99,
                        reviewCount: 2,
                        averageRating: 4.5,
                        username: 'userA',
                    },
                ],
            },
        }).as('getCart');
        cy.intercept('GET', '/store/prompts/*/rating-summary', { statusCode: 200, body: { averageRating: 4.5, reviewCount: 2 } });
        cy.intercept('POST', '/cart/checkout', { statusCode: 200, body: { message: 'Checkout successful' } }).as('checkout');
        cy.visit('/cart');
        cy.wait('@getCart');
        cy.contains('Checkout').click();
        cy.wait('@checkout');
        cy.on('window:alert', (text) => {
            expect(text).to.contains('Checkout successful');
        });
        cy.contains('Your cart is empty').should('be.visible');
    });

    it('should show error on checkout failure', () => {
        cy.intercept('GET', '/cart', {
            statusCode: 200,
            body: {
                content: [
                    {
                        cartItemId: 'cart-1',
                        promptId: 'prompt-1',
                        promptTitle: 'Prompt A',
                        promptTags: ['Writing'],
                        promptPrice: 9.99,
                        reviewCount: 2,
                        averageRating: 4.5,
                        username: 'userA',
                    },
                ],
            },
        }).as('getCart');
        cy.intercept('GET', '/store/prompts/*/rating-summary', { statusCode: 200, body: { averageRating: 4.5, reviewCount: 2 } });
        cy.intercept('POST', '/cart/checkout', { statusCode: 500, body: { message: 'Checkout failed' } }).as('checkout');
        cy.visit('/cart');
        cy.wait('@getCart');
        cy.contains('Checkout').click();
        cy.wait('@checkout');
        cy.on('window:alert', (text) => {
            expect(text).to.contains('Checkout failed');
        });
        cy.contains('Prompt A').should('be.visible');
    });

    it('should navigate to marketplace from cart', () => {
        cy.intercept('GET', '/cart', { statusCode: 200, body: { content: [] } }).as('getCart');
        cy.visit('/cart');
        cy.wait('@getCart');
        cy.contains('Explore Marketplace').click();
        cy.url().should('include', '/marketplace');
    });
}); 