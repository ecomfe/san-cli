/* global context,Cypress,cy */
/* eslint-disable jest/expect-expect */
// 删除刚刚创建的项目
context('Remove Project', () => {
    it('Successfully remove project', () => {
        cy.visit('/');

        // 返回到项目列表页
        cy.get('.project-list .list-item', {timeout: 3000}).should('be.visible');

        // 项目完成了创建
        cy.get('.project-list').should('contain', 'san-cli-ui-test');

        cy.get('.project-list .list-item .operation-btn-wrap').last().click();
    });
});
