/* global context,Cypress,cy */
/* eslint-disable jest/expect-expect */
context('The Project Manage Pages', () => {
    it('Successfully loads homepage', () => {
        cy.visit('http://localhost:3338');
        cy.get('.logo').should('be.visible');
        cy.get('.santd-layout-has-sider').should('not.exist');
        cy.get('.footer-wrapper').should('not.exist');
    });

    // 创建项目流程
    it('Create a project', () => {
        cy.visit('/home/create');
        cy.get('.footer-wrapper').should('be.visible');
        cy.get('.santd-layout-has-sider').should('not.exist');
        cy.get('.icon.star-icon').click();

        // 填写项目安装路径
        cy.get('.icon.edit-icon').click();
        cy.get('.path-guide').within($el => {
            cy.get('input.santd-input').clear().type(Cypress.env('cwd') + '{enter}');
        });
        cy.get('.create-project-start').click();
        cy.get('.create-project-next').click();

        cy.get('.project-create').within(() => {
            cy.get('.app-name input.santd-input').type('san-cli-ui-test');
            cy.get('.create-project-submit').click();
        });

        // 返回到项目列表页
        cy.get('.project-list .list-item', {timeout: 300000}).should('be.visible');

        // 项目完成了创建
        cy.get('.project-list').should('contain', 'san-cli-ui-test');

        // 删除刚刚创建的项目
        cy.get('.project-list .list-item .operation-btn-wrap').last().click();
    });

    // 导入项目的流程
    it('Import a project', () => {
        cy.visit('/home/import');
        cy.get('.footer-wrapper').should('be.visible');
        cy.get('.santd-layout-has-sider').should('not.exist');
        cy.get('.icon.star-icon').click();

        // 导入当前项目
        cy.get('.icon.edit-icon').click();
        cy.get('.path-guide').within($el => {
            cy.get('input.santd-input').clear().type(Cypress.env('cwd') + '/san-cli-ui-test' + '{enter}');
        });

        cy.get('.project-import .footer-wrapper .santd-btn').click();

        // 返回到项目列表页，5分钟安装时间
        cy.get('.project-list .list-item', {timeout: 3000}).should('be.visible');
        cy.get('.project-list').should('contain', 'san-cli-ui-test');

        // 进入刚刚创建的项目
        cy.get('.project-list .list-item').last().click();
    });
});
