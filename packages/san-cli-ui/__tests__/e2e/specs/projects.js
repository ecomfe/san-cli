/* global context,Cypress,cy */
/* eslint-disable jest/expect-expect */
context('The Project Manage Pages', () => {
    it('Successfully loads homepage', () => {
        cy.visit('http://localhost:3338');
        cy.get('.logo').should('be.visible');
        cy.get('.santd-layout-has-sider').should('not.exist');
        cy.get('.footer-wrapper').should('not.exist');
    });

    it('Create a project', () => {
        cy.visit('/home/create');
        cy.get('.footer-wrapper').should('be.visible');
        cy.get('.santd-layout-has-sider').should('not.exist');
        cy.get('.icon.star-icon').click();
        // 导入当前项目
        cy.get('.icon.edit-icon').click();
        cy.get('.path-guide').within($el => {
            cy.get('input.santd-input').clear().type(Cypress.env('cwd') + '{enter}');
        });
        cy.get('.create-project-start').click();
    });

    it('Import a project', () => {
        cy.visit('/home/import');
        cy.get('.footer-wrapper').should('be.visible');
        cy.get('.santd-layout-has-sider').should('not.exist');
        cy.get('.icon.star-icon').click();
        // 导入当前项目
        cy.get('.icon.edit-icon').click();
        cy.get('.path-guide').within($el => {
            cy.get('input.santd-input').clear().type(Cypress.env('cwd') + '{enter}');
            cy.get('button span').contains('san-cli-ui').parent().click();
        });
    });
});
