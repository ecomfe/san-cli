/* global context,Cypress,cy */
/* eslint-disable jest/expect-expect */
context('The Dependency Page', () => {
    it('Successfully loads dependencies', () => {
        cy.visit('/project/dependency');

        // 左侧边栏存在
        cy.get('.santd-layout-sider').should('be.visible');
        cy.get('.dependency-icon').should('be.visible');

        // 列表加载成功
        cy.get('.dependency-wrapper').should('be.visible');
    });

    it('Successfully opens dependencies modal dialog', () => {
        cy.get('.dependency-header .com-santd-btn-medium').last().click();
        cy.get('.dependency-search', {timeout: 1000}).should('be.visible');
        cy.get('.dependency-search-item', {timeout: 3000}).should('be.visible');
    });
});
