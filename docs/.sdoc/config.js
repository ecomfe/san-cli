/**
 * 文档配置
 * @author kidnes
 */
'use strict';

module.exports = {
    base: '/san-cli/',
    title: 'San CLI',
    head: [
        ['link', {rel: 'icon', href: '/san-cli/favicon.ico'}]
    ],

    themeConfig: {
        nav: [
            {text: 'San', link: 'https://baidu.github.io/san/'},
            {text: 'Santd', link: 'https://ecomfe.github.io/santd/'},
            {text: 'Github', link: 'https://github.com/ecomfe/eslint-plugin-san'}
        ],

        sidebar: {
            '/': [{
                    title: '介绍',
                    path: '/',
                }, {
                    title: '基础命令',
                    children: ['/create-project/', '/serve/', '/build/']
                }, {
                    title: '配置',
                    children: ['/config/', '/advanced/', '/presets/', '/env/']
                }, {
                    title: '常见解决方案',
                    children: ['/modern-mode/', '/bundle-analyze/', '/component/', '/smarty/', '/deployment/', '/hulk-cli-migration/']
                }, {
                    title: '二次开发',
                    children: ['/architecture/', '/create-scaffold/', {
                        path: '/plugin/',
                        children: ['/cmd-plugin/', '/srv-plugin/']
                    }]
                }, {
                    title: 'CLI UI',
                    children: ['/ui/start/', {
                        title: '功能简介',
                        children: ['/ui/project-list/', '/ui/dashboard/', '/ui/plugin/', '/ui/dependency/', '/ui/configuration/', '/ui/task/']
                    }, {
                        title: '插件开发',
                        children: ['/ui/structure/', '/ui/plugin-object/', '/ui/add-addon/', '/ui/add-config/', '/ui/cover-task/', '/ui/add-view/', '/ui/static/']
                    }]
                }]
        }
    }
};

