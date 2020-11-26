/* global context,Cypress,cy */
/* eslint-disable jest/expect-expect */
context('The Dashboard Page', () => {
    it('Successfully loads dashboard', () => {
        cy.visit('/project/dashboard');
        // 左侧边栏存在
        cy.get('.santd-layout-sider').should('be.visible');
        cy.get('.dashboard-icon').should('be.visible');

        // 默认组件加载成功
        cy.get('.dashboard-widget-welcome').should('be.visible');
        cy.get('.dashboard-widget-kill-port').should('be.visible');
    });

    it('Successfully adds dashboard widget', () => {
        // 右侧边栏交互
        cy.get('.dashboard-header .custom-icon').click();
        cy.get('.dashboard-content .widget-item .actions').first().click();
        cy.get('.dashboard-content .widget-item .actions').last().click();

        // 默认组件加载成功
        cy.get('.dashboard-widget-welcome').should('be.visible');
        cy.get('.dashboard-widget-kill-port').should('be.visible');
        cy.get('.dashboard-header .check-icon').click();

        cy.get('.dashboard-widget-news', {timeout: 2000}).should('be.exist');
    });
});
