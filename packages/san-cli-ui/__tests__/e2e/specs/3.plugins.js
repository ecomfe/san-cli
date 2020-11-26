/* global context,Cypress,cy */
/* eslint-disable jest/expect-expect */
context('The Plugins Page', () => {
    it('Successfully loads plugins', () => {
        cy.visit('/project/plugins');
        // 左侧边栏存在
        cy.get('.santd-layout-sider').should('be.visible');
        cy.get('.plugins-icon').should('be.visible');

        // 列表加载成功
        cy.get('.plugins-list').should('be.visible');
    });

    it('Successfully opens plugin modal dialog', () => {
        cy.get('.plugins-header .com-santd-btn-medium').last().click();
        cy.get('.dependency-modal', {timeout: 1000}).should('be.visible');
        cy.get('.dependency-search-item', {timeout: 3000}).should('be.visible');
    });
});
