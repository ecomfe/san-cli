/* global context,Cypress,cy */
/* eslint-disable jest/expect-expect */
context('The Task Pages', () => {
    it('Successfully loads task list', () => {
        cy.visit('/project/task');
        // 左侧边栏存在
        cy.get('.santd-layout-sider').should('be.visible');
        cy.get('.task-icon').should('be.visible');

        // 默认组件加载成功
        cy.get('.task-cards').should('be.visible');
    });

    it('Successfully loads task page', () => {
        cy.get('.task-cards .task-card-item').first().click();
        cy.get('.task-content', {timeout: 2000}).should('be.visible');
        cy.get('.task-content .task-head').should('be.visible');
        cy.get('.task-content .task-main-views').should('be.visible');

        // 自定义视图加载成功
        cy.get('.task-view-content .task-dashboard').should('be.visible');
    });

    it('Successfully switches between tabs', () => {
        cy.get('.task-bar .task-view-tab').first().click();
        cy.get('.xterm-viewport').should('be.visible');

        cy.get('.task-bar .task-view-tab').last().click();
        cy.get('.chart-details').should('be.visible');
    });

    it('Successfully goto another task', () => {
        cy.get('.task-nav .task-nav-item').eq(1).click();
        cy.get('.task-nav .task-nav-item').eq(1).should('have.class', 'task-nav-item-current');
        cy.get('.task-view-content .task-dashboard').should('be.visible');
    });
});
