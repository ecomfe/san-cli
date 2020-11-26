/* global context,Cypress,cy */
/* eslint-disable jest/expect-expect */
context('The Configuration Page', () => {
    it('Successfully loads configuration', () => {
        cy.visit('/project/configuration');

        // 左侧边栏存在
        cy.get('.santd-layout-sider').should('be.visible');
        cy.get('.configuration-icon').should('be.visible');

        // 列表加载成功
        cy.get('.configuration').should('be.visible');
    });

    it('Successfully opens san cli configuration', () => {
        cy.get('.nav-list .list-item').last().click();
        cy.get('.config-content', {timeout: 1000}).should('be.visible');
        cy.get('.santd-form-item-control').should('be.visible');
    });
});
