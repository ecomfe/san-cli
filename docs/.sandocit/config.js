/**
 * 文档配置
 * @author kidnes
 */
'use strict';

module.exports = {
    base: '/san-cli/',
    title: 'San CLI',

    themeConfig: {
        nav: [
            {text: 'San', link: 'https://baidu.github.io/san/'},
            {text: 'Santd', link: 'https://ecomfe.github.io/santd/'}
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
                    children: [{
                        path: '/ui/start/',
                        children: [{
                            title: '功能简介',
                            children: ['/ui/project-list/', '/ui/dashboard/', '/ui/plugin/', '/ui/dependency/', '/ui/configuration/', '/ui/task/']
                        }, {
                            title: '插件开发',
                            children: ['/ui/structure/', '/ui/plugin-object/', '/ui/add-addon/', '/ui/add-config/', '/ui/task/', '/ui/add-view/', '/ui/static/']
                        }]
                    }]
                }]
        }
    }
};
