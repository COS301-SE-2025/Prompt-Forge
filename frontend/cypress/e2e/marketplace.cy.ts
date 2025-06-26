
describe('Prompt Marketplace', () => {
  beforeEach(() => {
    cy.session('jwt-login', () => {
      cy.login();
    });
    cy.visit('/marketplace');
  });

  describe('Display and navigation', () => { 
    it('displays loading indicator initially', () => {
      cy.contains('Loading marketplace...').should('exist');
    });
  
    it('displays prompts after loading', () => {
      cy.get('#data-header').contains('All Prompts');
      cy.get('.prompt-card').should('exist')
    });

    it('navigates to prompt', () => {
      cy.get('.prompt-card').first().within(() => {
        cy.get('a[href*="/prompt/"]').should('exist').then(($link) => {
          const href = $link.attr('href');
          const expectedUrl = href;

          cy.wrap($link).click();
          cy.url().should('include', expectedUrl);
        });
      });
    })

    it('paginates correctly', () => {
      cy.contains('Next').click();
      cy.get('.prompt-card').should('exist')
      cy.contains('Previous').click();
      cy.get('.prompt-card').should('exist')
    });
  })

  describe('Filtering', () => {
    it('filter prompts - by Design category', () => {
      cy.contains('Design').click(); 
      cy.get('.prompt-card').should('have.length.greaterThan', 0)
      .each(($card) => {
        cy.wrap($card)
          .find('span') 
          .should('contain.text', "Design");
      });
        it('clears all filters when "Clear Filters" is clicked', () => {
          cy.get('input[placeholder*="Search"]').type('nonexistentprompt');
          cy.contains('No prompts found').should('exist');
          cy.contains('Clear Filters').click();
          cy.get('.prompt-card').should('exist')
        });
      })

      it('filters prompts by Featured', () => {
        cy.contains('Featured').click();
        cy.get('.prompt-card').should('exist')
      });

      it('filter prompts - get all prompts', () => {
        cy.contains('All Categories').click();
        cy.get('.prompt-card').should('exist')
      });
  });
  
    describe('Search', () => {
      it('searches for existing prompts', () => {
        cy.get('input[placeholder*="Search"]').type('Financial');
        cy.get('.prompt-card').should('exist')
      });
    
      it('searches for non-existent prompts', () => {
        cy.get('input[placeholder*="Search"]').type('nonexistentprompt');
        cy.get('.prompt-card').should('have.length.lessThan', 1)
      });
    })

});
